import 'dotenv/config'
import Broker, { PublicationSession, SubscriberSessionAsPromised } from 'rascal'

interface SetterConfig {
	key: string
	prefix: string
}

export class RabbitMQ {
	private brokerConfig: Broker.BrokerConfig
	private key: string
	private prefix: string

	constructor(key: string, prefix: string) {
		this.key = key
		this.prefix = prefix
		this.setConfig({ key, prefix })
	}

	private setConfig(config: SetterConfig) {
		const pubConfig: Broker.PublicationConfig = {
			vhost: process.env.RABBITMQ_VHOST,
			exchange: `rabbitmq_ex:${config.prefix}`,
			routingKey: 'a.b.c',
			options: {
				persistent: true,
				mandatory: true
			},
			autoCreated: true
		}

		const subConfig: Broker.PublicationConfig = {
			vhost: process.env.RABBITMQ_VHOST,
			queue: `rabbitmq_eq:${config.prefix}`,
			options: {
				mandatory: true,
				deliveryMode: true
			},
			autoCreated: true
		}

		const newPubConfig: Record<string, any> = {}
		Object.assign(newPubConfig, { [`rabbitmq_pub:${config.key}:${config.prefix}`]: pubConfig })

		const newSubConfig: Record<string, any> = {}
		Object.assign(newSubConfig, { [`rabbitmq_sub:${config.key}:${config.prefix}`]: subConfig })

		this.brokerConfig = {
			vhosts: {
				[`${process.env.RABBITMQ_VHOST}`]: {
					connectionStrategy: 'fixed',
					connection: {
						vhost: process.env.RABBITMQ_VHOST,
						hostname: process.env.RABBITMQ_HOST,
						user: process.env.RABBITMQ_USERNAME,
						password: process.env.RABBITMQ_PASSWORD,
						port: process.env.RABBITMQ_PORT,
						protocol: process.env.RABBITMQ_PROTOCOL
					},
					publications: newPubConfig,
					subscriptions: newSubConfig,
					exchanges: {
						[`rabbitmq_ex:${config.prefix}`]: {
							options: {
								durable: true,
								autoDelete: false
							},
							type: 'topic'
						}
					},
					queues: {
						[`rabbitmq_eq:${config.prefix}`]: {
							options: {
								durable: true,
								autoDelete: false,
								maxPriority: 10
							}
						}
					},
					bindings: {
						[`rabbitmq_ex:${config.prefix}[a.b.c] -> rabbitmq_eq:${config.prefix}`]: {
							source: `rabbitmq_ex:${config.prefix}`,
							destination: `rabbitmq_eq:${config.prefix}`,
							destinationType: 'queue'
						}
					}
				}
			},
			recovery: {
				[`rabbitmq_pub:${config.key}:${config.prefix}`]: [
					{ strategy: 'republish', requeue: true, defer: 1000, attempts: 10 },
					{ strategy: 'nack' }
				],
				[`rabbitmq_sub:${config.key}:${config.prefix}`]: { strategy: 'ack' }
			}
		}
	}

	private getConfig(): Broker.BrokerConfig {
		return this.brokerConfig
	}

	private async connection(): Promise<any> {
		try {
			const broker: Broker.BrokerAsPromised = await Broker.BrokerAsPromised.create(this.getConfig())
			broker.on('error', console.error)
			return broker
		} catch (err: any) {
			return new Error(err.message)
		}
	}

	async publisher(data: Record<string, any> | Record<string, any>[]): Promise<any> {
		try {
			const connection: Broker.BrokerAsPromised = await this.connection()
			const publisher: PublicationSession = await connection.publish(`rabbitmq_pub:${this.key}:${this.prefix}`, data)

			console.info('RabbitMQ publisher is called')

			publisher.on('success', (jobId: string) => console.log(`job ${jobId} is success`))
			publisher.on('error', async (_err: Error, jobId: string) => {
				console.log(`job ${jobId} is error`)
				await connection.shutdown()
			})

			return true
		} catch (err: any) {
			return new Error(err.message)
		}
	}

	async subscriber(cb: (content: any, error?: Error) => any): Promise<void> {
		try {
			const connection: Broker.BrokerAsPromised = await this.connection()
			const subscriber: SubscriberSessionAsPromised = await connection.subscribe(`rabbitmq_sub:${this.key}:${this.prefix}`)

			console.info('RabbitMQ subscriber is called')

			subscriber
				.on('message', (_message: any, content: any, ackOrNack: Broker.AckOrNack): void => {
					cb(content)
					ackOrNack()
				})
				.on('error', console.error)
		} catch (err: any) {
			cb(null, err)
		}
	}
}
