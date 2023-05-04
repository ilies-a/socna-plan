import Image from 'next/image'
import { Inter } from 'next/font/google'
import PlanDynamic from '@/components/plan/plan-dynamic.component'
import styles from './../styles/index.module.scss'
import PlanElementMenu from '@/components/plan-element-menu/plan-element-menu.component'
import StageTestDynamic from '@/components/plan/stage-test-dynamic.component'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className={styles['main']}>
      {/* <StageTestDynamic/> */}
      <PlanDynamic />
      <PlanElementMenu />
    </div>
  )
}
