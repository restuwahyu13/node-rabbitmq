import { RabbitMQ } from './rascal'

// rabbitmq  publisher
;(async () => {
	try {
		const broker: InstanceType<typeof RabbitMQ> = new RabbitMQ('send:message', 'node')
		let i = 0
		setInterval(async () => {
			const res = await broker.publisher({ message: `Hello World:${new Date().getTime()}` })
			console.log(res)
		}, 2000)
	} catch (err) {
		console.error(err)
	}
})()
