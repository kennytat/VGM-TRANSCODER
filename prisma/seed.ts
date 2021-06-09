import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const rootData: Prisma.RootCreateInput[] = [
  {
    name: 'root',
    qm: 'Qm00',
    categories: {
      create: [
        {
          name: 'videoCategory',
          qm: 'Qm1',
          classify: {
            create: [
              {
                name: 'videoClassification',
                qm: 'Qm11',
                topic: {
                  create: [
                    {
                      name: 'videoTopic',
                      qm: 'Qm111',
                      content: {
                        create: [
                          {
                            name: 'video1',
                            qm: 'Qm1111',
                            duration: 520,
                            size: 123,
                            thumb: '/this is video1 thumbnail url',
                            isvideo: true
                          },
                          {
                            name: 'video2',
                            qm: 'Qm1112',
                            duration: 123123,
                            size: 123312313,
                            thumb: '/this is video2 thumbnail url',
                            isvideo: true
                          } 
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          name: 'audioCategory',
          qm: 'Qm2',
          classify: {
            create: [
              {
                name: 'audioClassification',
                qm: 'Qm21',
                topic: {
                  create: [
                    {
                      name: 'audioTopic',
                      qm: 'Qm211',
                      content: {
                        create: [
                          {
                            name: 'audio1',
                            qm: 'Qm2111',
                            duration: 520,
                            size: 123,
                            thumb: '/this is audio thumbnail url',
                            isvideo: true
                          },
                          {
                            name: 'audio2',
                            qm: 'Qm2112',
                            duration: 520,
                            size: 123,
                            thumb: '/this is audio thumbnail url',
                            isvideo: true
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
      ],
    },
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of rootData) {
    const root = await prisma.root.create({
      data: u,
    })
    console.log(`Created user with id: ${root.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
