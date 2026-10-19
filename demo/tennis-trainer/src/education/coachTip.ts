import type { PlayMode, StrokeId } from '../presets/strokes'

export type CoachTipKind = 'intro' | 'flight' | 'bounce1' | 'bounce2'

export type CoachTip = {
  kind: CoachTipKind
  title: string
  body: string
}

export type CoachTipInput = {
  stroke: StrokeId
  playMode: PlayMode
  time: number
  enableBounce: boolean
  firstBounceT: number | null
  secondBounceT: number | null
}

const BOUNCE_WINDOW = 0.22

function near(time: number, target: number | null) {
  return target != null && Math.abs(time - target) <= BOUNCE_WINDOW
}

function bounce1Copy(stroke: StrokeId): CoachTip {
  switch (stroke) {
    case 'topspin':
      return {
        kind: 'bounce1',
        title: '一弹：上旋球往前窜！',
        body:
          '球在快速旋转，像小轮子贴地滚。落地时地面推它一把，所以弹起来后还会往网前冲——这就是上旋的「二跳」感觉。',
      }
    case 'slice':
      return {
        kind: 'bounce1',
        title: '一弹：切削球比较飘',
        body:
          '切削让球往后转，落地后不太往前冲，常常弹得轻、落点浅，对手容易上来抢。',
      }
    case 'sideSpin':
      return {
        kind: 'bounce1',
        title: '一弹：侧旋会拐弯',
        body:
          '球带着侧向旋转落地，弹起时还会往左或往右滑一点，路线弯弯的。',
      }
    default:
      return {
        kind: 'bounce1',
        title: '一弹：平击 mostly 往上弹',
        body:
          '平击球转得少，落地后 mainly 往上弹起，往前窜不如上旋那么明显。',
      }
  }
}

function flightCopy(stroke: StrokeId, playMode: PlayMode): CoachTip {
  if (playMode === 'serve') {
    return {
      kind: 'flight',
      title: '看球飞过网',
      body:
        '发球从底线打出，弧线要高 enough 过网，再掉进对面发球区。旋转会让落点更刁钻。',
    }
  }
  switch (stroke) {
    case 'topspin':
      return {
        kind: 'flight',
        title: '飞行：上旋弧线',
        body:
          '刷球让球向前转，空气把它往下按，所以弧线弯、过网后还会往下扎——准备看落地一弹！',
      }
    case 'slice':
      return {
        kind: 'flight',
        title: '飞行：切削弧线',
        body: '拍面切削让球飘、转，飞得慢一些，弧线更「飘」。',
      }
    case 'sideSpin':
      return {
        kind: 'flight',
        title: '飞行：侧旋弯弧',
        body: '横向刷球，球在空中会往侧面弯，像画弧线。',
      }
    default:
      return {
        kind: 'flight',
        title: '飞行：平击直线',
        body: '力量大、旋转少，路线更直、更快。',
      }
  }
}

function introCopy(stroke: StrokeId): CoachTip {
  const map: Record<StrokeId, string> = {
    flat: '试试对比平击和上旋：看谁一弹往前窜得更远。',
    topspin: '上旋适合压对手底线，留意黄圈（一弹）和橙圈（二弹）。',
    slice: '切削落点浅，适合调动对手上网。',
    sideSpin: '侧旋把对手拉出场外，给下一拍创造空档。',
  }
  return {
    kind: 'intro',
    title: '小教练提示',
    body: map[stroke],
  }
}

export function pickCoachTip(input: CoachTipInput): CoachTip {
  const { stroke, playMode, time, enableBounce, firstBounceT, secondBounceT } =
    input

  if (enableBounce && near(time, secondBounceT)) {
    return {
      kind: 'bounce2',
      title: '二弹：球再弹一次',
      body:
        '第二次弹起更小、更慢。上旋球有时二弹还会往前溜一点，对手最难接。',
    }
  }

  if (enableBounce && near(time, firstBounceT)) {
    return bounce1Copy(stroke)
  }

  if (firstBounceT != null && time < firstBounceT - 0.05) {
    return flightCopy(stroke, playMode)
  }

  if (enableBounce && firstBounceT != null && time > firstBounceT + BOUNCE_WINDOW) {
    return introCopy(stroke)
  }

  return introCopy(stroke)
}
