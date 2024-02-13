import LoadingWrapper from '#components/LoadingWrapper'
import { signOut } from 'next-auth/react'
import { useRouter as useNavigation } from 'next/navigation'
import { FC, useEffect } from 'react'
import { toast } from 'sonner'

const SignoutPage: FC = () => {
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      try {
        const response = await signOut({
          redirect: false,
          callbackUrl: '/',
        })

        navigation.push(response.url)
      } catch (err) {
        toast.error(err.message || err)
      }
    })()
  }, [navigation])

  return <LoadingWrapper loading label="Signing out.." />
}

export default SignoutPage
