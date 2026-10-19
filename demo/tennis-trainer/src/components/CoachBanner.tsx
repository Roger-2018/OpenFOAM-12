import type { CoachTip } from '../education/coachTip'

type Props = {
  tip: CoachTip
}

export function CoachBanner({ tip }: Props) {
  return (
    <div className={`coach-banner coach-${tip.kind}`} role="status">
      <strong>{tip.title}</strong>
      <p>{tip.body}</p>
    </div>
  )
}
