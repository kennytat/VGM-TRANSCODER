import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const mediaData: Prisma.MediaCreateInput[] = [
  {
    name: 'root',
    qm: 'Qm00',
    categories: {
      create: [
        {
          name: 'videoDB',
          qm: 'Qm1',
          classes: {
            create: [
              {
                name: '01-Bài Giảng',
                qm: 'Qm11',
                topics: {
                  create: [
                    {
                      name: 'Các Diễn Giả',
                      qm: 'Qm111',
                      contents: {
                        create: [
                          {
                            name: 'MSTPT_Bài Giảng Thứ Nhất',
                            duration: 520,
                            size: 123,
                            thumb: '/this is video1 thumbnail url',
                            filetype: 'video'
                          },
                          {
                            name: 'MSTPT_Bài Giảng Thứ Hai ',
                            qm: 'Qm1112',
                            duration: 123123,
                            size: 123312313,
                            thumb: '/this is video2 thumbnail url',
                            filetype: 'video'
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
          name: 'audioDB',
          qm: 'Qm2',
          classes: {
            create: [
              {
                name: 'Bài Giảng Theo Diễn Giả',
                qm: 'Qm21',
                topics: {
                  create: [
                    {
                      name: 'MS. Nguyễn Hữu Bình',
                      qm: 'Qm211',
                      contents: {
                        create: [
                          {
                            name: 'MSTPT Bài Giảng Thứ Nhất',
                            qm: 'Qm2111',
                            duration: 520,
                            size: 123,
                            thumb: '/this is audio thumbnail url',
                            filetype: 'audio'
                          },
                          {
                            name: 'MSTPT Bài Giảng Thứ Hai',
                            duration: 520,
                            size: 123,
                            thumb: '/this is audio thumbnail url',
                            filetype: 'audio'
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
  for (const u of mediaData) {
    const media = await prisma.media.create({
      data: u,
    })
    console.log(`Created user with id: ${media.id}`)
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
