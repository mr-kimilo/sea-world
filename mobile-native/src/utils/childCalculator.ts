/**
 * 价值观纠正器 — 纯前端计算引擎
 * 从 child-service/backend/items_data.py 迁移
 */

export type Category = "drink" | "food" | "fruit" | "toy" | "clothes" | "stationery";
export type AgeBand = "0-6" | "6-9" | "9-12" | "12-15";

export interface ShopItem {
  id: string;
  nameZh: string;
  nameEn: string;
  price: number;
  unitZh: string;
  unitEn: string;
  category: Category;
  icon: string;
  ageBand: AgeBand;
}

export interface CalcResult {
  item: ShopItem;
  count: number;
  remainder: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  drink: "🥤 饮品",
  food: "🍔 食品",
  fruit: "🍎 水果",
  toy: "🎮 玩具",
  clothes: "👕 衣服",
  stationery: "✏️ 文具",
};

export const AGE_BANDS: { id: AgeBand; label: string; labelEn: string; min: number; max: number }[] = [
  { id: "0-6", label: "0-6 岁 · 基础认知", labelEn: "0-6 yr · Basics", min: 0, max: 6 },
  { id: "6-9", label: "6-9 岁 · 探索期", labelEn: "6-9 yr · Explorer", min: 6, max: 9 },
  { id: "9-12", label: "9-12 岁 · 兴趣期", labelEn: "9-12 yr · Growth", min: 9, max: 12 },
  { id: "12-15", label: "12-15 岁 · 独立期", labelEn: "12-15 yr · Independent", min: 12, max: 15 },
];

export const ALL_ITEMS: ShopItem[] = [
  // ═══ 0-6 岁 ═══
  { id: "milk", nameZh: "蒙牛纯牛奶", nameEn: "Milk (250ml)", price: 3.0, unitZh: "盒", unitEn: "box", category: "drink", icon: "🥛", ageBand: "0-6" },
  { id: "yogurt", nameZh: "酸奶", nameEn: "Yogurt", price: 5.0, unitZh: "杯", unitEn: "cup", category: "drink", icon: "🥤", ageBand: "0-6" },
  { id: "cola", nameZh: "可乐", nameEn: "Cola", price: 3.5, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "🥫", ageBand: "0-6" },
  { id: "juice", nameZh: "橙汁", nameEn: "Orange Juice", price: 6.0, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "🧃", ageBand: "0-6" },
  { id: "egg", nameZh: "鸡蛋", nameEn: "Eggs", price: 1.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🥚", ageBand: "0-6" },
  { id: "bread", nameZh: "面包", nameEn: "Bread", price: 5.0, unitZh: "个", unitEn: "loaf", category: "food", icon: "🍞", ageBand: "0-6" },
  { id: "noodle", nameZh: "方便面", nameEn: "Instant Noodles", price: 4.0, unitZh: "包", unitEn: "pack", category: "food", icon: "🍜", ageBand: "0-6" },
  { id: "cookie", nameZh: "饼干", nameEn: "Cookies", price: 8.0, unitZh: "袋", unitEn: "bag", category: "food", icon: "🍪", ageBand: "0-6" },
  { id: "rice", nameZh: "大米", nameEn: "Rice", price: 3.0, unitZh: "斤", unitEn: "lb", category: "food", icon: "🍚", ageBand: "0-6" },
  { id: "pork", nameZh: "猪肉", nameEn: "Pork", price: 15.0, unitZh: "斤", unitEn: "lb", category: "food", icon: "🥩", ageBand: "0-6" },
  { id: "apple", nameZh: "苹果", nameEn: "Apple", price: 2.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🍎", ageBand: "0-6" },
  { id: "banana", nameZh: "香蕉", nameEn: "Banana", price: 1.5, unitZh: "根", unitEn: "piece", category: "fruit", icon: "🍌", ageBand: "0-6" },
  { id: "orange", nameZh: "橘子", nameEn: "Orange", price: 3.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🍊", ageBand: "0-6" },
  { id: "grape", nameZh: "葡萄", nameEn: "Grapes", price: 10.0, unitZh: "斤", unitEn: "lb", category: "fruit", icon: "🍇", ageBand: "0-6" },
  { id: "toy_car", nameZh: "玩具小汽车", nameEn: "Toy Car", price: 25.0, unitZh: "辆", unitEn: "unit", category: "toy", icon: "🚗", ageBand: "0-6" },
  { id: "doll", nameZh: "布娃娃", nameEn: "Doll", price: 35.0, unitZh: "个", unitEn: "unit", category: "toy", icon: "🧸", ageBand: "0-6" },
  { id: "lego", nameZh: "乐高小积木", nameEn: "Lego Set", price: 50.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "🧱", ageBand: "0-6" },
  { id: "ball", nameZh: "小皮球", nameEn: "Bouncy Ball", price: 10.0, unitZh: "个", unitEn: "unit", category: "toy", icon: "⚽", ageBand: "0-6" },
  { id: "slime", nameZh: "水晶泥", nameEn: "Slime", price: 8.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "🫧", ageBand: "0-6" },
  { id: "socks", nameZh: "袜子", nameEn: "Socks", price: 8.0, unitZh: "双", unitEn: "pair", category: "clothes", icon: "🧦", ageBand: "0-6" },
  { id: "hat", nameZh: "小帽子", nameEn: "Hat", price: 25.0, unitZh: "顶", unitEn: "piece", category: "clothes", icon: "🧢", ageBand: "0-6" },
  { id: "tshirt_kid", nameZh: "卡通T恤", nameEn: "Cartoon T-Shirt", price: 35.0, unitZh: "件", unitEn: "piece", category: "clothes", icon: "👕", ageBand: "0-6" },
  { id: "pencil", nameZh: "铅笔", nameEn: "Pencil", price: 1.0, unitZh: "支", unitEn: "piece", category: "stationery", icon: "✏️", ageBand: "0-6" },
  { id: "eraser", nameZh: "橡皮", nameEn: "Eraser", price: 2.0, unitZh: "块", unitEn: "piece", category: "stationery", icon: "🧹", ageBand: "0-6" },
  { id: "notebook", nameZh: "作业本", nameEn: "Notebook", price: 5.0, unitZh: "本", unitEn: "book", category: "stationery", icon: "📓", ageBand: "0-6" },
  { id: "crayon", nameZh: "蜡笔", nameEn: "Crayons (12 colors)", price: 15.0, unitZh: "盒", unitEn: "box", category: "stationery", icon: "🖍️", ageBand: "0-6" },
  // ═══ 6-9 岁 ═══
  { id: "yogurt_drink", nameZh: "乳酸菌饮料", nameEn: "Yogurt Drink", price: 3.0, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "🥤", ageBand: "6-9" },
  { id: "soda", nameZh: "汽水", nameEn: "Soda", price: 3.0, unitZh: "罐", unitEn: "can", category: "drink", icon: "🥫", ageBand: "6-9" },
  { id: "choco_milk", nameZh: "巧克力奶", nameEn: "Choco Milk", price: 6.0, unitZh: "盒", unitEn: "box", category: "drink", icon: "🧋", ageBand: "6-9" },
  { id: "juice_box", nameZh: "果汁饮料", nameEn: "Juice Box", price: 4.0, unitZh: "盒", unitEn: "box", category: "drink", icon: "🧃", ageBand: "6-9" },
  { id: "chocolate", nameZh: "巧克力", nameEn: "Chocolate", price: 12.0, unitZh: "块", unitEn: "bar", category: "food", icon: "🍫", ageBand: "6-9" },
  { id: "chips", nameZh: "薯片", nameEn: "Chips", price: 6.0, unitZh: "袋", unitEn: "bag", category: "food", icon: "🥨", ageBand: "6-9" },
  { id: "candy", nameZh: "棒棒糖", nameEn: "Lollipop", price: 1.0, unitZh: "支", unitEn: "piece", category: "food", icon: "🍭", ageBand: "6-9" },
  { id: "ice_cream", nameZh: "冰淇淋", nameEn: "Ice Cream", price: 5.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🍦", ageBand: "6-9" },
  { id: "cake", nameZh: "小蛋糕", nameEn: "Cupcake", price: 15.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🧁", ageBand: "6-9" },
  { id: "jelly", nameZh: "果冻", nameEn: "Jelly", price: 2.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🍮", ageBand: "6-9" },
  { id: "strawberry", nameZh: "草莓", nameEn: "Strawberry", price: 8.0, unitZh: "盒", unitEn: "box", category: "fruit", icon: "🍓", ageBand: "6-9" },
  { id: "peach", nameZh: "桃子", nameEn: "Peach", price: 5.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🍑", ageBand: "6-9" },
  { id: "watermelon", nameZh: "西瓜", nameEn: "Watermelon", price: 15.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🍉", ageBand: "6-9" },
  { id: "lego_small", nameZh: "乐高小套装", nameEn: "Lego Small Set", price: 35.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "🧱", ageBand: "6-9" },
  { id: "remote_car", nameZh: "遥控小汽车", nameEn: "RC Car", price: 45.0, unitZh: "辆", unitEn: "unit", category: "toy", icon: "🏎️", ageBand: "6-9" },
  { id: "puzzle", nameZh: "拼图", nameEn: "Puzzle", price: 20.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "🧩", ageBand: "6-9" },
  { id: "water_gun", nameZh: "水枪", nameEn: "Water Gun", price: 15.0, unitZh: "把", unitEn: "piece", category: "toy", icon: "🔫", ageBand: "6-9" },
  { id: "bubble", nameZh: "泡泡机", nameEn: "Bubble Machine", price: 10.0, unitZh: "个", unitEn: "unit", category: "toy", icon: "🫧", ageBand: "6-9" },
  { id: "cartoon_tshirt", nameZh: "印花T恤", nameEn: "Printed T-Shirt", price: 35.0, unitZh: "件", unitEn: "piece", category: "clothes", icon: "👕", ageBand: "6-9" },
  { id: "cap", nameZh: "棒球帽", nameEn: "Baseball Cap", price: 20.0, unitZh: "顶", unitEn: "piece", category: "clothes", icon: "🧢", ageBand: "6-9" },
  { id: "backpack", nameZh: "小书包", nameEn: "Kids Backpack", price: 55.0, unitZh: "个", unitEn: "unit", category: "clothes", icon: "🎒", ageBand: "6-9" },
  { id: "colored_pen", nameZh: "彩色笔", nameEn: "Colored Pen", price: 8.0, unitZh: "套", unitEn: "set", category: "stationery", icon: "🖊️", ageBand: "6-9" },
  { id: "sticker", nameZh: "贴纸", nameEn: "Sticker Pack", price: 3.0, unitZh: "张", unitEn: "sheet", category: "stationery", icon: "⭐", ageBand: "6-9" },
  { id: "sharpener", nameZh: "卷笔刀", nameEn: "Sharpener", price: 5.0, unitZh: "个", unitEn: "piece", category: "stationery", icon: "✂️", ageBand: "6-9" },
  { id: "glitter_pen", nameZh: "闪光笔", nameEn: "Glitter Pen", price: 6.0, unitZh: "支", unitEn: "piece", category: "stationery", icon: "✨", ageBand: "6-9" },
  // ═══ 9-12 岁 ═══
  { id: "bubble_tea", nameZh: "珍珠奶茶", nameEn: "Bubble Tea", price: 12.0, unitZh: "杯", unitEn: "cup", category: "drink", icon: "🧋", ageBand: "9-12" },
  { id: "smoothie", nameZh: "水果冰沙", nameEn: "Fruit Smoothie", price: 15.0, unitZh: "杯", unitEn: "cup", category: "drink", icon: "🥤", ageBand: "9-12" },
  { id: "sports_drink", nameZh: "运动饮料", nameEn: "Sports Drink", price: 6.0, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "🧃", ageBand: "9-12" },
  { id: "water_bottle", nameZh: "瓶装水", nameEn: "Bottled Water", price: 2.0, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "💧", ageBand: "9-12" },
  { id: "hotpot_noodle", nameZh: "自热小火锅", nameEn: "Self-Heating Hotpot", price: 18.0, unitZh: "盒", unitEn: "box", category: "food", icon: "🍲", ageBand: "9-12" },
  { id: "beef_jerky", nameZh: "牛肉干", nameEn: "Beef Jerky", price: 25.0, unitZh: "袋", unitEn: "bag", category: "food", icon: "🥩", ageBand: "9-12" },
  { id: "popcorn", nameZh: "爆米花", nameEn: "Popcorn", price: 8.0, unitZh: "桶", unitEn: "tub", category: "food", icon: "🍿", ageBand: "9-12" },
  { id: "protein_bar", nameZh: "能量棒", nameEn: "Protein Bar", price: 10.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🍫", ageBand: "9-12" },
  { id: "takoyaki", nameZh: "章鱼小丸子", nameEn: "Takoyaki", price: 12.0, unitZh: "份", unitEn: "serving", category: "food", icon: "🐙", ageBand: "9-12" },
  { id: "blueberry", nameZh: "蓝莓", nameEn: "Blueberry", price: 15.0, unitZh: "盒", unitEn: "box", category: "fruit", icon: "🫐", ageBand: "9-12" },
  { id: "mango", nameZh: "芒果", nameEn: "Mango", price: 12.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🥭", ageBand: "9-12" },
  { id: "cherry", nameZh: "樱桃", nameEn: "Cherry", price: 20.0, unitZh: "斤", unitEn: "lb", category: "fruit", icon: "🍒", ageBand: "9-12" },
  { id: "board_game", nameZh: "桌游", nameEn: "Board Game", price: 60.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "🎲", ageBand: "9-12" },
  { id: "frisbee", nameZh: "飞盘", nameEn: "Frisbee", price: 25.0, unitZh: "个", unitEn: "piece", category: "toy", icon: "🥏", ageBand: "9-12" },
  { id: "skateboard", nameZh: "滑板", nameEn: "Skateboard", price: 120.0, unitZh: "个", unitEn: "unit", category: "toy", icon: "🛹", ageBand: "9-12" },
  { id: "model_kit", nameZh: "模型套装", nameEn: "Model Kit", price: 80.0, unitZh: "盒", unitEn: "box", category: "toy", icon: "✈️", ageBand: "9-12" },
  { id: "drone_toy", nameZh: "玩具无人机", nameEn: "Toy Drone", price: 150.0, unitZh: "架", unitEn: "unit", category: "toy", icon: "🛸", ageBand: "9-12" },
  { id: "hoodie", nameZh: "卫衣", nameEn: "Hoodie", price: 100.0, unitZh: "件", unitEn: "piece", category: "clothes", icon: "🧥", ageBand: "9-12" },
  { id: "jeans", nameZh: "牛仔裤", nameEn: "Jeans", price: 120.0, unitZh: "条", unitEn: "piece", category: "clothes", icon: "👖", ageBand: "9-12" },
  { id: "sneakers", nameZh: "运动鞋", nameEn: "Sneakers", price: 150.0, unitZh: "双", unitEn: "pair", category: "clothes", icon: "👟", ageBand: "9-12" },
  { id: "marker_set", nameZh: "马克笔套装", nameEn: "Marker Set", price: 18.0, unitZh: "套", unitEn: "set", category: "stationery", icon: "🖍️", ageBand: "9-12" },
  { id: "sketchbook", nameZh: "素描本", nameEn: "Sketchbook", price: 12.0, unitZh: "本", unitEn: "book", category: "stationery", icon: "📒", ageBand: "9-12" },
  { id: "compass", nameZh: "圆规套装", nameEn: "Compass Set", price: 15.0, unitZh: "套", unitEn: "set", category: "stationery", icon: "📐", ageBand: "9-12" },
  { id: "fountain_pen", nameZh: "钢笔", nameEn: "Fountain Pen", price: 25.0, unitZh: "支", unitEn: "piece", category: "stationery", icon: "🖊️", ageBand: "9-12" },
  // ═══ 12-15 岁 ═══
  { id: "coffee", nameZh: "现磨咖啡", nameEn: "Brewed Coffee", price: 25.0, unitZh: "杯", unitEn: "cup", category: "drink", icon: "☕", ageBand: "12-15" },
  { id: "milkshake", nameZh: "奶昔", nameEn: "Milkshake", price: 18.0, unitZh: "杯", unitEn: "cup", category: "drink", icon: "🥤", ageBand: "12-15" },
  { id: "energy_drink", nameZh: "功能饮料", nameEn: "Energy Drink", price: 8.0, unitZh: "罐", unitEn: "can", category: "drink", icon: "🥫", ageBand: "12-15" },
  { id: "sparkling", nameZh: "苏打水", nameEn: "Sparkling Water", price: 5.0, unitZh: "瓶", unitEn: "bottle", category: "drink", icon: "💧", ageBand: "12-15" },
  { id: "sushi", nameZh: "寿司拼盘", nameEn: "Sushi Platter", price: 30.0, unitZh: "份", unitEn: "serving", category: "food", icon: "🍣", ageBand: "12-15" },
  { id: "pizza", nameZh: "披萨", nameEn: "Pizza Slice", price: 20.0, unitZh: "片", unitEn: "slice", category: "food", icon: "🍕", ageBand: "12-15" },
  { id: "burger", nameZh: "汉堡", nameEn: "Burger", price: 25.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🍔", ageBand: "12-15" },
  { id: "protein_bar_teen", nameZh: "蛋白棒", nameEn: "Protein Bar", price: 12.0, unitZh: "个", unitEn: "piece", category: "food", icon: "🍫", ageBand: "12-15" },
  { id: "imported_grape", nameZh: "进口青提", nameEn: "Imported Grapes", price: 30.0, unitZh: "斤", unitEn: "lb", category: "fruit", icon: "🍇", ageBand: "12-15" },
  { id: "avocado", nameZh: "牛油果", nameEn: "Avocado", price: 12.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🥑", ageBand: "12-15" },
  { id: "pomegranate", nameZh: "石榴", nameEn: "Pomegranate", price: 15.0, unitZh: "个", unitEn: "piece", category: "fruit", icon: "🫐", ageBand: "12-15" },
  { id: "game_card", nameZh: "游戏充值卡", nameEn: "Game Gift Card", price: 60.0, unitZh: "张", unitEn: "card", category: "toy", icon: "🎮", ageBand: "12-15" },
  { id: "earphone", nameZh: "入耳式耳机", nameEn: "Earphone", price: 80.0, unitZh: "副", unitEn: "set", category: "toy", icon: "🎧", ageBand: "12-15" },
  { id: "phone_case", nameZh: "手机壳", nameEn: "Phone Case", price: 20.0, unitZh: "个", unitEn: "piece", category: "toy", icon: "📱", ageBand: "12-15" },
  { id: "mouse", nameZh: "游戏鼠标", nameEn: "Gaming Mouse", price: 45.0, unitZh: "个", unitEn: "piece", category: "toy", icon: "🖱️", ageBand: "12-15" },
  { id: "keyboard", nameZh: "机械键盘", nameEn: "Mechanical Keyboard", price: 100.0, unitZh: "个", unitEn: "piece", category: "toy", icon: "⌨️", ageBand: "12-15" },
  { id: "brand_tshirt", nameZh: "品牌T恤", nameEn: "Brand T-Shirt", price: 80.0, unitZh: "件", unitEn: "piece", category: "clothes", icon: "👕", ageBand: "12-15" },
  { id: "joggers", nameZh: "运动裤", nameEn: "Joggers", price: 90.0, unitZh: "条", unitEn: "piece", category: "clothes", icon: "👖", ageBand: "12-15" },
  { id: "watch", nameZh: "运动手表", nameEn: "Sports Watch", price: 150.0, unitZh: "块", unitEn: "piece", category: "clothes", icon: "⌚", ageBand: "12-15" },
  { id: "sunglasses", nameZh: "太阳镜", nameEn: "Sunglasses", price: 60.0, unitZh: "副", unitEn: "pair", category: "clothes", icon: "🕶️", ageBand: "12-15" },
  { id: "gel_pen_set", nameZh: "中性笔套装", nameEn: "Gel Pen Set", price: 8.0, unitZh: "盒", unitEn: "box", category: "stationery", icon: "🖊️", ageBand: "12-15" },
  { id: "calculator", nameZh: "科学计算器", nameEn: "Scientific Calculator", price: 35.0, unitZh: "个", unitEn: "piece", category: "stationery", icon: "🔢", ageBand: "12-15" },
  { id: "art_set", nameZh: "美术套装", nameEn: "Art Set", price: 40.0, unitZh: "套", unitEn: "set", category: "stationery", icon: "🎨", ageBand: "12-15" },
  { id: "highlighter", nameZh: "荧光笔套装", nameEn: "Highlighter Set", price: 12.0, unitZh: "套", unitEn: "set", category: "stationery", icon: "🖍️", ageBand: "12-15" },
];

/** 年龄 → 年龄段 */
export function ageToBand(age: number): AgeBand {
  if (age < 6) return "0-6";
  if (age < 9) return "6-9";
  if (age < 12) return "9-12";
  return "12-15";
}

/** 按年龄段获取物品 */
export function getItemsByAgeBand(ageBand: AgeBand): ShopItem[] {
  return ALL_ITEMS.filter((item) => item.ageBand === ageBand);
}

/** 计算能买多少 */
export function calculate(amount: number, items: ShopItem[]): CalcResult[] {
  return items.map((item) => {
    const count = Math.floor(amount / item.price);
    const remainder = Math.round((amount - count * item.price) * 100) / 100;
    return { item, count, remainder };
  });
}

/** 生成语音文本 */
export function speakText(item: ShopItem, count: number, lang: string): string {
  if (lang === "zh") {
    return `${count}${item.unitZh}${item.nameZh}`;
  }
  return `${count} ${item.unitEn}${count > 1 ? "s" : ""} of ${item.nameEn}`;
}
