import Image from 'next/image'
import { Inter } from 'next/font/google'
import PlanDynamic from '@/components/plan/plan-dynamic.component'
import styles from './../styles/index.module.scss'
import StageTestDynamic from '@/components/plan/stage-test-dynamic.component'
import PlanElementMenu from '@/components/plan-element-menu/plan-element-menu.component'
import ActionMenu from '@/components/action-menu/action-menu.component'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className={styles['main']}>
      {/* <StageTestDynamic/> */}
      <ActionMenu/>
      <div className={styles['menu-and-plan-wrapper']}>
        <PlanElementMenu />
        <PlanDynamic />
      </div>
    </div>
  )
}
