import type { DesignStatus } from '@/shared-core'

export class DesignVersion {
  constructor(
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number,
    public readonly status: DesignStatus
  ) {}

  static initial(): DesignVersion {
    return new DesignVersion(1, 0, 0, 'draft')
  }

  increment(): DesignVersion {
    return new DesignVersion(
      this.major,
      this.minor,
      this.patch + 1,
      'draft'
    )
  }

  toString(): string {
    return `v${this.major}.${this.minor}.${this.patch}`
  }
}


