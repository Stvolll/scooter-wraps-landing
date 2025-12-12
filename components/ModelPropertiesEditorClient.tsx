'use client'

import ModelPropertiesEditor from './ModelPropertiesEditor'

export default function ModelPropertiesEditorClient({
  designId,
  initialProperties,
}: {
  designId: string
  initialProperties?: any
}) {
  return <ModelPropertiesEditor designId={designId} initialProperties={initialProperties} />
}



