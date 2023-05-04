import dynamic from 'next/dynamic';

const StageTestDynamic = dynamic(() => import('./stage-test.component'), {
    ssr: false,
})
  
export default StageTestDynamic;