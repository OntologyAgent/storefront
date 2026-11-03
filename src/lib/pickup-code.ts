/**
 * Pickup code + a good wish for the customer.
 *
 * Three families, all short enough to print on a pickup voucher and read at a counter:
 *  - BLESSINGS  — classic well-wishes (Irish / Navajo / everyday), the "美好祝福" family
 *  - MOTTOS     — Latin and service-corps style sayings (格言)
 *  - POETIC     — lyric fragments (诗句)
 *
 * The numeric part stays the order number (staff need it to find the order). The phrase is
 * deterministic per order, so the customer's voucher, the merchant's Telegram receipt and
 * the confirmation page always agree. FNV-1a + an avalanche mix keeps sequential order
 * numbers from landing on the same phrase.
 */

/** 祝福 — blessings, the default voice. Each line carries its Chinese reading in a comment. */
export const BLESSINGS = [
	"WALK IN BEAUTY", // 步步生花
	"WIND AT YOUR BACK", // 顺风相送
	"SUN ON YOUR FACE", // 向阳而生
	"PEACE IN YOUR HEART", // 心中安宁
	"JOY IN YOUR DAYS", // 日日欢喜
	"GOOD FORTUNE FOLLOW", // 好运随行
	"HEALTH AND HAPPINESS", // 健康喜乐
	"LONG LIFE AND LAUGHTER", // 长寿常笑
	"WARM HEARTS, FULL CUPS", // 心暖杯满
	"SAFE PASSAGE", // 一路平安
	"SAFE HARBOUR", // 安稳靠岸
	"FAIR WINDS AND SEAS", // 风平浪静
	"CALM SEAS", // 海晏波平
	"MAY YOUR DAY BE KIND", // 愿你被岁月温柔以待
	"KIND DAY TO YOU", // 温柔待你
	"GOOD DAY TO YOU", // 愿你今日顺遂
	"BRIGHT DAY TO YOU", // 愿你今日明亮
	"ALL GOOD THINGS", // 万事胜意
	"EVERY GOOD WISH", // 万事如意
	"MANY HAPPY RETURNS", // 岁岁欢愉
	"EASY DAYS, GOOD NIGHTS", // 白日从容，夜晚安眠
	"SLOW MORNINGS, LONG EVENINGS", // 晨光慢，夜话长
	"REST EASY", // 安心歇息
	"TAKE YOUR TIME", // 来日方长
	"ENJOY THE JOURNEY", // 且行且赏
	"TRAVEL LIGHT", // 轻装上路
	"TREAD LIGHTLY", // 轻步人间
	"LIVE WELL", // 好好生活
	"BE HAPPY", // 愿你快乐
	"STAY CURIOUS", // 保持好奇
	"STAY KIND", // 保持善良
	"KEEP GOING", // 继续前行
	"KEEP SMILING", // 常带笑意
	"LIFT YOUR HEART", // 心向高处
	"HEARTS UP", // 昂首向前
	"HOLD YOUR HEAD HIGH", // 昂首挺胸
	"STAND TALL", // 站得笔直
	"WALK TALL", // 走得从容
	"SHINE ON", // 继续闪耀
	"RISE AND SHINE", // 旭日东升
	"GOOD THINGS AHEAD", // 好事在前
	"BRIGHT THINGS AHEAD", // 明景在前
	"FINE DAYS AHEAD", // 好日子在后头
	"NEW HORIZONS", // 新的地平线
	"BRIGHT BEGINNINGS", // 明亮的开始
	"HAPPY TRAILS", // 旅途愉快
	"SAFE TRAVELS", // 一路顺风
	"UNTIL NEXT TIME", // 后会有期
	"SEE YOU SOON", // 再会可期
	"TAKE CARE", // 珍重
	"ALL THE BEST", // 万事顺遂
	"WELL WISHES", // 万千祝愿
	"GOOD COMPANY", // 良友相伴
	"SMALL WINS", // 小胜亦喜
	"QUIET JOY", // 静好之喜
	"SWEET MOMENTS", // 甘甜时刻
	"WARM WELCOME", // 暖意相迎
	"WRAP UP WARM", // 添衣保暖
	"STAY HYDRATED", // 多喝热水
	"DEEP BREATHS", // 深呼吸，慢下来
] as const;

/** 格言 — English mottos only: service corps, quiet resolve, no Latin. */
export const MOTTOS = [
	"TO PROTECT AND SERVE", // 守护与服务
	"SERVE AND PROTECT", // 服务与守护
	"SERVICE ABOVE SELF", // 服务高于自我
	"FIDELITY, BRAVERY, INTEGRITY", // 忠诚、勇敢、正直
	"COURAGE AND HONOUR", // 勇气与荣誉
	"STRENGTH AND HONOUR", // 力量与荣誉
	"DUTY AND HONOUR", // 责任与荣誉
	"HONOUR AND INTEGRITY", // 荣誉与正直
	"TRUTH AND COURAGE", // 真实与勇气
	"COURAGE OVER COMFORT", // 宁取勇气，不取安逸
	"RISE ABOVE", // 超越其上
	"AIM HIGH", // 志存高远
	"STAY THE COURSE", // 不改其志
	"NEVER GIVE UP", // 永不放弃
	"NEVER DESPAIR", // 永不失望
	"ALL FOR ONE", // 人人为我
	"ONE FOR ALL", // 我为人人
	"SEIZE THE DAY", // 把握今日
	"ALWAYS FAITHFUL", // 永远忠诚
	"ALWAYS READY", // 时刻准备
	"TO THE STARS", // 向星辰
	"THROUGH HARDSHIP TO THE STARS", // 历经艰难，终抵群星
	"LIFT UP YOUR HEARTS", // 扬起心来
	"DARE TO KNOW", // 敢于求知
	"CONQUER YOURSELF", // 自胜者强
	"ON YOUR OWN WINGS", // 以己之翼翱翔
	"FORTUNE FAVOURS THE BRAVE", // 幸运眷顾勇者
	"FORTUNE FAVOURS THE BOLD", // 命运助无畏者
	"KEEP THE FAITH", // 守住信念
	"LEAD BY EXAMPLE", // 以身作则
	"DO THE RIGHT THING", // 做对的事
	"PAY IT FORWARD", // 善行相传
	"ONE STEP AT A TIME", // 一步一步来
	"STEADY AS SHE GOES", // 稳稳当当
	"LEAVE IT BETTER", // 让它比来时更好
] as const;

/** 诗句 — lyric fragments and small images. */
export const POETIC = [
	"THE ROAD GOES EVER ON", // 长路依旧向前
	"FIRST LIGHT", // 晨光初现
	"GOLDEN HOUR", // 流金时刻
	"QUIET HEART", // 心静如水
	"OPEN SKY", // 天阔云开
	"CLEAR HORIZON", // 地平线清晰
	"SOFT LANDING", // 温柔着陆
	"FULL SAIL", // 满帆而行
	"STARS ALIGN", // 星辰各就其位
	"WARM LIGHT", // 暖光
	"GENTLE RAIN", // 细雨
	"SUNRISE AHEAD", // 前方日出
	"MORNING GLORY", // 晨光之美
	"EVENING STAR", // 长庚星
	"SILVER LINING", // 云隙之光
	"SECOND WIND", // 再续一口气
	"OPEN ROAD", // 大路朝天
	"CALM WATERS", // 静水
	"WIDE OPEN SKY", // 天宽地阔
	"MORNING DEW", // 晨露
	"SUMMER LIGHT", // 夏日之光
	"AUTUMN GOLD", // 秋色金黄
	"SPRING RAIN", // 春雨
	"NOON LIGHT", // 正午的光
	"STARLIGHT", // 星光
	"DAWN CHORUS", // 破晓鸟鸣
	"SEA BREEZE", // 海风
	"FIRST SNOW", // 初雪
	"LONG SHADOWS", // 长影漫地
	"PAPER LANTERNS", // 纸灯
] as const;

/**
 * Optional local flavour: Australian sayings, kept as a separate style.
 * Only warm entries; anything crude or sarcastic was dropped.
 */
export const AUSSIE_PHRASES = [
	"SHE'LL BE APPLES",
	"SHE'LL BE RIGHT",
	"GOOD AS GOLD",
	"YOU BEAUTY",
	"LITTLE RIPPER",
	"GOOD ON YA",
	"NO WORRIES",
	"NO DRAMAS",
	"TOO EASY",
	"TOO RIGHT",
	"FAIR DINKUM",
	"DINKY-DI",
	"RIDGY-DIDGE",
	"FAIR GO",
	"COME GOOD",
	"RIPPER",
	"BONZA",
	"GROUSE",
	"STOKED",
	"ONYA",
	"HAPPY DAYS",
	"BRIGHT SPARK",
	"TRUE BLUE",
	"GOOD SPORT",
] as const;

export type PickupStyle = "blessing" | "aussie" | "mix";

/**
 * Which family the voucher draws from.
 *  - `blessing` (default): 祝福 + 英文格言 + 诗句
 *  - `aussie`: Australian sayings only
 *  - `mix`: everything
 */
export const PICKUP_STYLE: PickupStyle = "blessing";

function phrasesForStyle(style: PickupStyle): readonly string[] {
	switch (style) {
		case "aussie":
			return AUSSIE_PHRASES;
		case "mix":
			return [...BLESSINGS, ...MOTTOS, ...POETIC, ...AUSSIE_PHRASES];
		default:
			return [...BLESSINGS, ...MOTTOS, ...POETIC];
	}
}

const ALL_PHRASES = phrasesForStyle(PICKUP_STYLE);

/** Salt keeps the hash away from trivial order-number patterns. */
const WORD_SALT = "lucky-pickup";

function fnv1a(value: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash >>> 0;
}

/** Final avalanche mix so sequential order numbers don't land on the same phrase. */
function mix32(value: number): number {
	let x = value >>> 0;
	x ^= x >>> 16;
	x = Math.imul(x, 0x7feb352d) >>> 0;
	x ^= x >>> 15;
	x = Math.imul(x, 0x846ca68b) >>> 0;
	x ^= x >>> 16;
	return x >>> 0;
}

export type PickupCode = {
	/** Order number as printed on the receipt. */
	order: string;
	/** Three-digit counter derived from the order number: 001–999, wrapping. */
	code: string;
	/** The wish shown alongside it, stable for this order. */
	phrase: string;
	/** `#043 · WALK IN BEAUTY` — what staff read out. */
	display: string;
};

/**
 * 3-digit pickup counter.
 *
 * Saleor numbers orders sequentially per channel, so the counter is derived from the order
 * number: order 1 → `001`, order 42 → `042`, order 1000 → `001` (wraps at 999). Deriving it
 * keeps the voucher stable without a counter table, and the 999 wrap is far longer than the
 * window a store holds an order.
 */
export function pickupCounterFor(orderNumber: string | number | null | undefined): string {
	const numeric = Number(orderNumber);
	if (!Number.isFinite(numeric) || numeric <= 0) return "---";
	const seat = ((Math.floor(numeric) - 1) % 999) + 1;
	return String(seat).padStart(3, "0");
}

export function pickupCodeFor(orderNumber: string | number | null | undefined): PickupCode {
	const order = String(orderNumber ?? "—");
	const code = pickupCounterFor(orderNumber);
	const phrase = ALL_PHRASES[mix32(fnv1a(`${order}${WORD_SALT}`)) % ALL_PHRASES.length];
	return { order, code, phrase, display: `#${code} · ${phrase}` };
}
