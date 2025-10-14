import prismadb from '@/lib/prismadb'
import { RedeemCodeStatus } from '@prisma/client'

async function main() {
  const redeemCodes = [
    { code: 'WJGWVGC5XF', licenseKey: 'J7XR8CDKCC-SEL3-W1N7-19HB-3089FBO933KP' },
    { code: 'ABCDEFGHIJ', licenseKey: 'SAMPLE-KEY1-ABCD-EFGH-IJKLMNOPQRST' },
    { code: 'KLMNOPQRST', licenseKey: 'SAMPLE-KEY2-UVWX-YZAB-CDEFGHIJKLMN' },
  ]

  for (const { code, licenseKey } of redeemCodes) {
    await prismadb.licenseKey.upsert({
      where: { key: licenseKey },
      update: {},
      create: {
        key: licenseKey,
        redeemCode: {
          create: {
            code: code,
            status: RedeemCodeStatus.CLAIMED
          }
        }
      },
    })
  }

  console.log('Redeem codes have been populated')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })