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
          foldertype: 'video',
          classes: {
            create: [
              {
                name: '01-Bài Giảng',
                qm: 'Qm11',
                foldertype: 'video',
                topics: {
                  create: [
                    {
                      name: 'Các Diễn Giả',
                      qm: 'Qm111',
                      foldertype: 'video',
                      contents: {
                        create: [
                          {
                            name: 'MSTPT_Bài Giảng Thứ Nhất',
                            duration: '520s',
                            size: '123mb',
                            thumb: '/this is video1 thumbnail url',
                            folder: '/home/user/Desktop/abc',
                            verse: 'psalms 20:10',
                            filetype: 'video'
                          },
                          {
                            name: 'MSTPT_Bài Giảng Thứ Hai ',
                            qm: 'Qm1112',
                            duration: '520s',
                            size: '123mb',
                            thumb: '/this is video2 thumbnail url',
                            folder: '/home/user/Desktop/abc',
                            verse: 'psalms 20:10',
                            filetype: 'video'
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                name: '02-Khoa Học Và Niềm Tin',
                foldertype: 'video',
                topics: {
                  create: [
                    {
                      name: '01-Sự Khởi Đầu',
                      foldertype: 'video'
                    }
                  ]
                }
              },
              {
                name: '03-Hoạt Hình',
                foldertype: 'video',
                topics: {
                  create: [
                    {
                      name: 'Hoạt Hình 2D',
                      foldertype: 'video'
                    }
                  ]
                }
              },
              {
                name: '04-Thiếu Nhi',
                foldertype: 'video',
                topics: {
                  create: [
                    {
                      name: 'Bước Theo Chúa Giê-xu',
                      foldertype: 'video'
                    }
                  ]
                }
              },
              {
                name: '05-Ngôn Ngữ Ký Hiệu',
                foldertype: 'video',
                topics: {
                  create: [
                    {
                      name: 'Giáo Lý Căn Bản',
                      foldertype: 'video'
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
          foldertype: 'audio',
          classes: {
            create: [
              {
                name: 'Bài Giảng Theo Diễn Giả',
                qm: 'Qm21',
                foldertype: 'audio',
                topics: {
                  create: [
                    {
                      name: 'MS. Nguyễn Hữu Bình',
                      qm: 'Qm211',
                      foldertype: 'audio',
                      contents: {
                        create: [
                          {
                            name: 'MSTPT Bài Giảng Thứ Nhất',
                            qm: 'Qm2111',
                            duration: '520s',
                            size: '123mb',
                            thumb: '/this is audio thumbnail url',
                            folder: '/home/user/Desktop/abc',
                            verse: 'psalms 20:10',
                            filetype: 'audio'
                          },
                          {
                            name: 'MSTPT Bài Giảng Thứ Hai',
                            duration: '520s',
                            size: '123mb',
                            thumb: '/this is audio thumbnail url',
                            folder: '/home/user/Desktop/abc',
                            verse: 'psalms 20:10',
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
