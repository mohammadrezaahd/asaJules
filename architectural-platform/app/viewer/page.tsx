'use client';

import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
});

const ViewerPage = () => {
  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <ModelViewer modelUrl="/sofa.glb" />
    </div>
  );
};

export default ViewerPage;