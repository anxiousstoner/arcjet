import * as express from 'express'
import * as cors from 'cors'

import Store from './store'

export const server = (store: Store, port: number) =>
  new Promise((resolve, reject) => {
    const app = express()

    app.use(cors())

    app.get('/:hash', async (req, res) => {
      try {
        const {data, error} = await store.get(req.params.hash)
        if (error && error === 'NOTFOUND') {
          res.status(404).send('Not Found')
        } else if (data) {
          res.statusCode = 200
          data.pipe(res)
        } else {
          res.status(500).send('Internal Server Error')
        }
      } catch (err) {
        console.error(err)
        res.status(500).send(err)
      }
    })

    app.post('/', async (req, res) => {
      try {
        const chunks: Buffer[] = []

        req.on('data', (data: Buffer) => {
          chunks.push(data)
        })

        req.on('end', async () => {
          const hash = await store.set(Buffer.concat(chunks).toString('utf8'))
          res.statusCode = 200
          res.contentType('text/plain')
          res.send(hash)
        })
      } catch (err) {
        console.error(err)
        res.status(500).send(err)
      }
    })

    app.listen(port, () => {
      resolve()
    })
  })
