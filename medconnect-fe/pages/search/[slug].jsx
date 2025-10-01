import { useRouter } from 'next/router'

export default function SearchPage() {
  const router = useRouter()
  const { slug } = router.query

  return <div>My Post: {slug}</div>
}