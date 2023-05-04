import dynamic from 'next/dynamic';

const PlanDynamic = dynamic(() => import('./plan.component'), {
    ssr: false,
})
  
export default PlanDynamic;