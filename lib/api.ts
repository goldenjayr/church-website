import { IVerse } from "./types"
export async function getRandomVerse(): Promise<IVerse> {
  return fetch(`https://bible-api.com/data/asv/random`, {
    next: { revalidate: getSecondsUntilMidnight() }
  }).then((res) => res.json()).then((data) => {
    const { random_verse } = data
    return {
      text: random_verse.text as string,
      reference: `${random_verse.book} ${random_verse.chapter}:${random_verse.verse}` as string,
    }
  })
}

function getSecondsUntilMidnight() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
}
