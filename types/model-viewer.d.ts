/**
 * Type declarations for @google/model-viewer web component
 *
 * This allows TypeScript to recognize <model-viewer> as a valid JSX element.
 */

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        alt?: string
        'camera-controls'?: boolean | string
        'auto-rotate'?: boolean | string
        'auto-rotate-delay'?: string
        'rotation-per-second'?: string
        'interaction-policy'?: string
        ar?: boolean | string
        'ar-modes'?: string
        'shadow-intensity'?: string
        exposure?: string
        'environment-image'?: string
        'skybox-image'?: string
        'variant-name'?: string
        'environment-image-rotation'?: string
        'tone-mapping'?: string
        'shadow-softness'?: string
        'camera-orbit'?: string
        'field-of-view'?: string
        'min-camera-orbit'?: string
        'max-camera-orbit'?: string
        loading?: string
        reveal?: string
        'skybox-height'?: string
      },
      HTMLElement
    >
  }
}

// Extend HTMLElement to include model-viewer specific properties
interface ModelViewerElement extends HTMLElement {
  src?: string
  variantName?: string
  model?: any
  scene?: any
  renderer?: any
  addEventListener(
    type: 'load',
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'load',
    listener: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void
  dispatchEvent(event: Event): boolean
}

declare global {
  interface Window {
    THREE?: any
  }
}

export {}
