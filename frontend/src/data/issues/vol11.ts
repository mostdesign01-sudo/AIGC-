import type { Issue } from '../types'

const TAG = 'vol11-gifs'

export const vol11: Issue = {
  vol: 11,
  volLabel: 'VOL.11',
  series: '得物 AIGC 创意双周报',
  timezone: 'Asia/Shanghai',
  publishedOn: '2026-08-31',
  windowStart: '2026-08-17',
  windowEnd: '2026-08-31',
  summary:
    '这一窗看三件能直接换进工作的事：短片把 Seedance 2.5 和 GPT Image 2 撑到约 26 分钟；通义万相 3.0 从 8/20 预览走到约 8/24 正式开放；芒果 TV《后西游记》按 30 集 × 40 分钟上星，8/31 开播。简报只抽这三条。九类里广告、工具各有两条值得点进去的样本，AR/物料本期空。窗口外的旧片不收录。',
  brief: [
    {
      id: 'wencangsheng',
      category: 'ai-short-film',
      title: '问苍生',
      why: '半小时体量的 AI 短片，把新模型用在长叙事，而不是 15 秒切片。',
      credit: '青瓜蛋丶 · Bilibili · 2026-08-17 · BV1rHbY6MEB9 · Seedance 2.5 + GPT Image 2 · 约 26 分钟',
      sources: [
        { label: 'Bilibili 原片', url: 'https://www.bilibili.com/video/BV1rHbY6MEB9/' },
      ],
      orientation: 'landscape',
      media: {
        releaseTag: TAG,
        video: '01-wencangsheng-src.mp4',
        gifs: ['01-wencangsheng-a.gif', '01-wencangsheng-b.gif'],
      },
    },
    {
      id: 'wan30',
      category: 'new-model',
      title: '通义万相 Wan 3.0',
      why: '窗口内走完预览到正式开放，是这期最能立刻换进制作的视频模型更新。',
      credit: '阿里云百炼 · Prime 8/20 · 正式开放约 8/24',
      sources: [
        { label: '阿里云文档', url: 'https://help.aliyun.com/zh/model-studio/wan3-0-video' },
      ],
      orientation: 'landscape',
      media: {
        releaseTag: TAG,
        video: '02-wan30-src.mp4',
        gifs: ['02-wan30-a.gif', '02-wan30-b.gif'],
      },
    },
    {
      id: 'houxiyouji',
      category: 'ip-character',
      title: '芒果TV《后西游记》',
      why: '上星长剧的 AIGC 体量（30 集 × 40 分钟），看连续剧怎么撑满单集，而不是短片技法。',
      credit: '芒果TV · 8/31 开播 · 30×40 分钟 · 上星 AIGC',
      sources: [
        { label: '预告片', url: 'https://www.mgtv.com/b/900162/24592408.html' },
        { label: '报道', url: 'https://www.ithome.com/0/996/265.htm' },
      ],
      orientation: 'landscape',
      media: {
        releaseTag: TAG,
        video: '03-houxiyouji-src.mp4',
        gifs: ['03-houxiyouji-a.gif', '03-houxiyouji-b.gif'],
      },
    },
  ],
  slots: [
    {
      slug: 'ai-short-film',
      items: [
        {
          title: '问苍生',
          why: '约 26 分钟长片，Seedance 2.5 + GPT Image 2。看新模型能不能撑住叙事，而不是只出金句镜头。',
          dateLabel: '2026-08-17',
          sources: [
            { label: 'Bilibili', url: 'https://www.bilibili.com/video/BV1rHbY6MEB9/' },
          ],
          media: {
            releaseTag: TAG,
            video: '01-wencangsheng-src.mp4',
          },
        },
      ],
    },
    {
      slug: 'ai-ad',
      items: [
        {
          title: 'Motorola India 100% AI',
          why: '品牌侧「全片 AI」广告，8/20–21 连发两条，看消费品怎么用生成影像做市场片。',
          dateLabel: '2026-08-20 – 08-21',
          sources: [
            { label: '成片 1', url: 'https://youtu.be/0uF69-ZyNYc' },
            { label: '成片 2', url: 'https://youtu.be/1iO2mqArf4s' },
          ],
        },
        {
          title: '中国移动《宇宙真心》',
          why: '8/20 见报的运营商全 AI 广告。和摩托罗拉两条一起看：品牌片现在默认可以全程生成。',
          dateLabel: '2026-08-20',
          sources: [
            {
              label: '8/20 报道',
              url: 'https://campaignbriefasia.com/2026/08/20/f5-shanghai-and-china-mobile-explore-the-power-of-connection-in-fully-ai-generated-qixi-film/',
            },
          ],
        },
      ],
    },
    {
      slug: 'fashion',
      items: [
        {
          title: 'ANAYI AW26 PASSAGE',
          why: '8/19 发布的 2026 秋冬 PASSAGE。换装/时尚这一窗的秀场样本，看季刊镜头怎么被做成可传播成片。',
          dateLabel: '2026-08-19',
          sources: [
            { label: 'PR TIMES', url: 'https://prtimes.jp/main/html/rd/p/000000235.000037181.html' },
          ],
        },
      ],
    },
    {
      slug: 'props-transition',
      items: [
        {
          title: 'Gemini Omni 1.1 Flash',
          why: '8/27 的 Omni 更新。转场和道具连贯要盯实时多模态，而不是事后补一刀特效。',
          dateLabel: '2026-08-27',
          sources: [
            {
              label: 'Google 博客',
              url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
            },
          ],
        },
      ],
    },
    {
      slug: 'ar-material',
      empty: true,
      emptyNote: '本期空',
      items: [],
    },
    {
      slug: 'ai-tool',
      items: [
        {
          title: 'MiniMax Design',
          why: '8/20 可直接打开的设计工具，看生成怎么接到平面和物料，而不是停在对话里。',
          dateLabel: '2026-08-20',
          sources: [{ label: '产品页', url: 'https://design.minimaxi.com/' }],
        },
        {
          title: 'Pika Soundtrack',
          why: '8/18 给成片补同步声场。短片和广告都能少一轮拟音。',
          dateLabel: '2026-08-18',
          sources: [
            { label: 'Pika 博客', url: 'https://experiment.pika.art/blog/pika-soundtrack' },
          ],
        },
      ],
    },
    {
      slug: 'new-model',
      items: [
        {
          title: '通义万相 Wan 3.0',
          why: 'Prime 8/20，正式开放约 8/24。窗口内就能换进分镜和广告测试。',
          dateLabel: '2026-08-20 / 约 08-24',
          sources: [
            { label: '阿里云文档', url: 'https://help.aliyun.com/zh/model-studio/wan3-0-video' },
          ],
          media: {
            releaseTag: TAG,
            video: '02-wan30-src.mp4',
          },
        },
      ],
    },
    {
      slug: '3d-render',
      items: [
        {
          title: 'updream 预演台',
          why: '窗口第一天出现的预演台。3D/渲染侧用来先排镜，再决定生成。',
          dateLabel: '2026-08-17',
          sources: [{ label: 'updream', url: 'https://www.updream.cn/' }],
        },
      ],
    },
    {
      slug: 'ip-character',
      items: [
        {
          title: '芒果TV《后西游记》',
          why: '8/31 开播的上星 AIGC 长剧，30 集 × 40 分钟。看 IP 怎么被拉成连续剧体量。',
          dateLabel: '2026-08-31',
          sources: [
            { label: '预告片', url: 'https://www.mgtv.com/b/900162/24592408.html' },
            { label: '报道', url: 'https://www.ithome.com/0/996/265.htm' },
          ],
          media: {
            releaseTag: TAG,
            video: '03-houxiyouji-src.mp4',
          },
        },
      ],
    },
  ],
}
