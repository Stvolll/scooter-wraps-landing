import { useRouter } from 'next/router'

interface ModelSelectorProps {
  models: any[]
  selectedModelId?: string
}

export default function ModelSelector({
  models,
  selectedModelId,
}: ModelSelectorProps) {
  const router = useRouter()

  const handleModelChange = (modelId: string) => {
    router.push(`/?model=${modelId}`, undefined, { shallow: true })
  }

  const safeModels = Array.isArray(models) ? models : []

  if (safeModels.length === 0) {
    return null
  }

  return (
    <div className="model-selector">
      {safeModels.map((model: any) => (
        <button
          key={model.id}
          className={`model-button ${
            model.id === selectedModelId ? 'active' : ''
          }`}
          onClick={() => handleModelChange(model.id)}
        >
          {model.name}
        </button>
      ))}
    </div>
  )
}
