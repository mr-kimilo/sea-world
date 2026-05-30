package com.seaworld.service;

import com.seaworld.dto.ValueCalculateResponse;
import com.seaworld.dto.ValueItemResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ValueService {

    // ── Item record ──
    public record Item(String id, String nameZh, String nameEn, double price,
                       String unitZh, String unitEn, String category, String icon, String ageBand) {}

    private final List<Item> ITEMS = buildItems();

    // ── I18n texts ──
    private static final Map<String, Map<String, String>> LANG = Map.of(
        "zh", Map.of(
            "currency", "元",
            "voice_info", "{amount}{currency} = {count}{unit}{name}"
        ),
        "en", Map.of(
            "currency", "$",
            "voice_info", "{amount}{currency} = {count} {name}"
        )
    );

    // ════════════════════════════════════════════════════════
    // API
    // ════════════════════════════════════════════════════════

    public List<String> getCategories() {
        return ITEMS.stream()
                .map(Item::category)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ValueItemResponse> getItems(String category, int age) {
        String band = ageToBand(age);
        String lang = "zh";
        return ITEMS.stream()
                .filter(i -> i.ageBand.equals(band))
                .filter(i -> category == null || category.isEmpty() || i.category.equals(category))
                .map(i -> ValueItemResponse.builder()
                        .id(i.id())
                        .name(lang.equals("zh") ? i.nameZh() : i.nameEn())
                        .price(i.price())
                        .unit(lang.equals("zh") ? i.unitZh() : i.unitEn())
                        .icon(i.icon())
                        .category(i.category())
                        .build())
                .collect(Collectors.toList());
    }

    public ValueCalculateResponse calculate(double amount, String itemId) {
        String lang = "zh";
        Item target = ITEMS.stream().filter(i -> i.id().equals(itemId)).findFirst().orElse(null);
        if (target == null) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }

        double price = target.price();
        if (amount < price) {
            return ValueCalculateResponse.builder()
                    .tooExpensive(true)
                    .name(lang.equals("zh") ? target.nameZh() : target.nameEn())
                    .price(price)
                    .unit(lang.equals("zh") ? target.unitZh() : target.unitEn())
                    .icon(target.icon())
                    .amount(amount)
                    .build();
        }

        int count = (int) Math.floor(amount / price);
        double remainder = Math.round((amount - count * price) * 100.0) / 100.0;
        String unit = lang.equals("zh") ? target.unitZh() : target.unitEn();
        String name = lang.equals("zh") ? target.nameZh() : target.nameEn();
        String currency = LANG.get(lang).get("currency");

        String voiceText = String.format("%.0f%s = %d%s%s", amount, currency, count, unit, name);

        return ValueCalculateResponse.builder()
                .tooExpensive(false)
                .name(name)
                .price(price)
                .unit(unit)
                .icon(target.icon())
                .amount(amount)
                .count(count)
                .remainder(remainder)
                .voiceText(voiceText)
                .useStack(count > 50)
                .build();
    }

    // ════════════════════════════════════════════════════════
    // Helpers
    // ════════════════════════════════════════════════════════

    private String ageToBand(int age) {
        if (age < 6) return "0-6";
        if (age < 9) return "6-9";
        if (age < 12) return "9-12";
        return "12-15";
    }

    // ════════════════════════════════════════════════════════
    // Item data (ported from child-service items_data.py)
    // ════════════════════════════════════════════════════════

    private List<Item> buildItems() {
        List<Item> list = new ArrayList<>();

        // ── 0-6 岁 ──
        // drink
        list.add(new Item("milk", "蒙牛纯牛奶", "Milk (250ml)", 3.0, "盒", "box", "drink", "🥛", "0-6"));
        list.add(new Item("yogurt", "酸奶", "Yogurt", 5.0, "杯", "cup", "drink", "🥤", "0-6"));
        list.add(new Item("cola", "可乐", "Cola", 3.5, "瓶", "bottle", "drink", "🥫", "0-6"));
        list.add(new Item("juice", "橙汁", "Orange Juice", 6.0, "瓶", "bottle", "drink", "🧃", "0-6"));
        // food
        list.add(new Item("egg", "鸡蛋", "Eggs", 1.0, "个", "piece", "food", "🥚", "0-6"));
        list.add(new Item("bread", "面包", "Bread", 5.0, "个", "loaf", "food", "🍞", "0-6"));
        list.add(new Item("noodle", "方便面", "Instant Noodles", 4.0, "包", "pack", "food", "🍜", "0-6"));
        list.add(new Item("cookie", "饼干", "Cookies", 8.0, "袋", "bag", "food", "🍪", "0-6"));
        list.add(new Item("rice", "大米", "Rice", 3.0, "斤", "lb", "food", "🍚", "0-6"));
        list.add(new Item("pork", "猪肉", "Pork", 15.0, "斤", "lb", "food", "🥩", "0-6"));
        // fruit
        list.add(new Item("apple", "苹果", "Apple", 2.0, "个", "piece", "fruit", "🍎", "0-6"));
        list.add(new Item("banana", "香蕉", "Banana", 1.5, "根", "piece", "fruit", "🍌", "0-6"));
        list.add(new Item("orange", "橘子", "Orange", 3.0, "个", "piece", "fruit", "🍊", "0-6"));
        list.add(new Item("grape", "葡萄", "Grapes", 10.0, "斤", "lb", "fruit", "🍇", "0-6"));
        // toy
        list.add(new Item("toy_car", "玩具小汽车", "Toy Car", 25.0, "辆", "unit", "toy", "🚗", "0-6"));
        list.add(new Item("doll", "布娃娃", "Doll", 35.0, "个", "unit", "toy", "🧸", "0-6"));
        list.add(new Item("lego", "乐高小积木", "Lego Set", 50.0, "盒", "box", "toy", "🧱", "0-6"));
        list.add(new Item("ball", "小皮球", "Bouncy Ball", 10.0, "个", "unit", "toy", "⚽", "0-6"));
        list.add(new Item("slime", "水晶泥", "Slime", 8.0, "盒", "box", "toy", "🫧", "0-6"));
        // clothes
        list.add(new Item("socks", "袜子", "Socks", 8.0, "双", "pair", "clothes", "🧦", "0-6"));
        list.add(new Item("hat", "小帽子", "Hat", 25.0, "顶", "piece", "clothes", "🧢", "0-6"));
        list.add(new Item("tshirt_kid", "卡通T恤", "Cartoon T-Shirt", 35.0, "件", "piece", "clothes", "👕", "0-6"));
        // stationery
        list.add(new Item("pencil", "铅笔", "Pencil", 1.0, "支", "piece", "stationery", "✏️", "0-6"));
        list.add(new Item("eraser", "橡皮", "Eraser", 2.0, "块", "piece", "stationery", "🧹", "0-6"));
        list.add(new Item("notebook", "作业本", "Notebook", 5.0, "本", "book", "stationery", "📓", "0-6"));
        list.add(new Item("crayon", "蜡笔", "Crayons (12 colors)", 15.0, "盒", "box", "stationery", "🖍️", "0-6"));

        // ── 6-9 岁 ──
        list.add(new Item("yogurt_drink", "乳酸菌饮料", "Yogurt Drink", 3.0, "瓶", "bottle", "drink", "🥤", "6-9"));
        list.add(new Item("soda", "汽水", "Soda", 3.0, "罐", "can", "drink", "🥫", "6-9"));
        list.add(new Item("choco_milk", "巧克力奶", "Choco Milk", 6.0, "盒", "box", "drink", "🧋", "6-9"));
        list.add(new Item("juice_box", "果汁饮料", "Juice Box", 4.0, "盒", "box", "drink", "🧃", "6-9"));
        list.add(new Item("chocolate", "巧克力", "Chocolate", 12.0, "块", "bar", "food", "🍫", "6-9"));
        list.add(new Item("chips", "薯片", "Chips", 6.0, "袋", "bag", "food", "🥨", "6-9"));
        list.add(new Item("candy", "棒棒糖", "Lollipop", 1.0, "支", "piece", "food", "🍭", "6-9"));
        list.add(new Item("ice_cream", "冰淇淋", "Ice Cream", 5.0, "个", "piece", "food", "🍦", "6-9"));
        list.add(new Item("cake", "小蛋糕", "Cupcake", 15.0, "个", "piece", "food", "🧁", "6-9"));
        list.add(new Item("jelly", "果冻", "Jelly", 2.0, "个", "piece", "food", "🍮", "6-9"));
        list.add(new Item("strawberry", "草莓", "Strawberry", 8.0, "盒", "box", "fruit", "🍓", "6-9"));
        list.add(new Item("peach", "桃子", "Peach", 5.0, "个", "piece", "fruit", "🍑", "6-9"));
        list.add(new Item("watermelon", "西瓜", "Watermelon", 15.0, "个", "piece", "fruit", "🍉", "6-9"));
        list.add(new Item("lego_small", "乐高小套装", "Lego Small Set", 35.0, "盒", "box", "toy", "🧱", "6-9"));
        list.add(new Item("remote_car", "遥控小汽车", "RC Car", 45.0, "辆", "unit", "toy", "🏎️", "6-9"));
        list.add(new Item("puzzle", "拼图", "Puzzle", 20.0, "盒", "box", "toy", "🧩", "6-9"));
        list.add(new Item("water_gun", "水枪", "Water Gun", 15.0, "把", "piece", "toy", "🔫", "6-9"));
        list.add(new Item("bubble", "泡泡机", "Bubble Machine", 10.0, "个", "unit", "toy", "🫧", "6-9"));
        list.add(new Item("cartoon_tshirt", "印花T恤", "Printed T-Shirt", 35.0, "件", "piece", "clothes", "👕", "6-9"));
        list.add(new Item("cap", "棒球帽", "Baseball Cap", 20.0, "顶", "piece", "clothes", "🧢", "6-9"));
        list.add(new Item("backpack", "小书包", "Kids Backpack", 55.0, "个", "unit", "clothes", "🎒", "6-9"));
        list.add(new Item("colored_pen", "彩色笔", "Colored Pen", 8.0, "套", "set", "stationery", "🖊️", "6-9"));
        list.add(new Item("sticker", "贴纸", "Sticker Pack", 3.0, "张", "sheet", "stationery", "⭐", "6-9"));
        list.add(new Item("sharpener", "卷笔刀", "Sharpener", 5.0, "个", "piece", "stationery", "✂️", "6-9"));
        list.add(new Item("glitter_pen", "闪光笔", "Glitter Pen", 6.0, "支", "piece", "stationery", "✨", "6-9"));

        // ── 9-12 岁 ──
        list.add(new Item("bubble_tea", "珍珠奶茶", "Bubble Tea", 12.0, "杯", "cup", "drink", "🧋", "9-12"));
        list.add(new Item("smoothie", "水果冰沙", "Fruit Smoothie", 15.0, "杯", "cup", "drink", "🥤", "9-12"));
        list.add(new Item("sports_drink", "运动饮料", "Sports Drink", 6.0, "瓶", "bottle", "drink", "🧃", "9-12"));
        list.add(new Item("water_bottle", "瓶装水", "Bottled Water", 2.0, "瓶", "bottle", "drink", "💧", "9-12"));
        list.add(new Item("hotpot_noodle", "自热小火锅", "Self-Heating Hotpot", 18.0, "盒", "box", "food", "🍲", "9-12"));
        list.add(new Item("beef_jerky", "牛肉干", "Beef Jerky", 25.0, "袋", "bag", "food", "🥩", "9-12"));
        list.add(new Item("popcorn", "爆米花", "Popcorn", 8.0, "桶", "tub", "food", "🍿", "9-12"));
        list.add(new Item("protein_bar", "能量棒", "Protein Bar", 10.0, "个", "piece", "food", "🍫", "9-12"));
        list.add(new Item("takoyaki", "章鱼小丸子", "Takoyaki", 12.0, "份", "serving", "food", "🐙", "9-12"));
        list.add(new Item("blueberry", "蓝莓", "Blueberry", 15.0, "盒", "box", "fruit", "🫐", "9-12"));
        list.add(new Item("mango", "芒果", "Mango", 12.0, "个", "piece", "fruit", "🥭", "9-12"));
        list.add(new Item("cherry", "樱桃", "Cherry", 20.0, "斤", "lb", "fruit", "🍒", "9-12"));
        list.add(new Item("board_game", "桌游", "Board Game", 60.0, "盒", "box", "toy", "🎲", "9-12"));
        list.add(new Item("frisbee", "飞盘", "Frisbee", 25.0, "个", "piece", "toy", "🥏", "9-12"));
        list.add(new Item("skateboard", "滑板", "Skateboard", 120.0, "个", "unit", "toy", "🛹", "9-12"));
        list.add(new Item("model_kit", "模型套装", "Model Kit", 80.0, "盒", "box", "toy", "✈️", "9-12"));
        list.add(new Item("drone_toy", "玩具无人机", "Toy Drone", 150.0, "架", "unit", "toy", "🛸", "9-12"));
        list.add(new Item("hoodie", "卫衣", "Hoodie", 100.0, "件", "piece", "clothes", "🧥", "9-12"));
        list.add(new Item("jeans", "牛仔裤", "Jeans", 120.0, "条", "piece", "clothes", "👖", "9-12"));
        list.add(new Item("sneakers", "运动鞋", "Sneakers", 150.0, "双", "pair", "clothes", "👟", "9-12"));
        list.add(new Item("marker_set", "马克笔套装", "Marker Set", 18.0, "套", "set", "stationery", "🖍️", "9-12"));
        list.add(new Item("sketchbook", "素描本", "Sketchbook", 12.0, "本", "book", "stationery", "📒", "9-12"));
        list.add(new Item("compass", "圆规套装", "Compass Set", 15.0, "套", "set", "stationery", "📐", "9-12"));
        list.add(new Item("fountain_pen", "钢笔", "Fountain Pen", 25.0, "支", "piece", "stationery", "🖊️", "9-12"));

        // ── 12-15 岁 ──
        list.add(new Item("coffee", "现磨咖啡", "Brewed Coffee", 25.0, "杯", "cup", "drink", "☕", "12-15"));
        list.add(new Item("milkshake", "奶昔", "Milkshake", 18.0, "杯", "cup", "drink", "🥤", "12-15"));
        list.add(new Item("energy_drink", "功能饮料", "Energy Drink", 8.0, "罐", "can", "drink", "🥫", "12-15"));
        list.add(new Item("sparkling", "苏打水", "Sparkling Water", 5.0, "瓶", "bottle", "drink", "💧", "12-15"));
        list.add(new Item("sushi", "寿司拼盘", "Sushi Platter", 30.0, "份", "serving", "food", "🍣", "12-15"));
        list.add(new Item("pizza", "披萨", "Pizza Slice", 20.0, "片", "slice", "food", "🍕", "12-15"));
        list.add(new Item("burger", "汉堡", "Burger", 25.0, "个", "piece", "food", "🍔", "12-15"));
        list.add(new Item("protein_bar_teen", "蛋白棒", "Protein Bar", 12.0, "个", "piece", "food", "🍫", "12-15"));
        list.add(new Item("imported_grape", "进口青提", "Imported Grapes", 30.0, "斤", "lb", "fruit", "🍇", "12-15"));
        list.add(new Item("avocado", "牛油果", "Avocado", 12.0, "个", "piece", "fruit", "🥑", "12-15"));
        list.add(new Item("pomegranate", "石榴", "Pomegranate", 15.0, "个", "piece", "fruit", "🫐", "12-15"));
        list.add(new Item("game_card", "游戏充值卡", "Game Gift Card", 60.0, "张", "card", "toy", "🎮", "12-15"));
        list.add(new Item("earphone", "入耳式耳机", "Earphone", 80.0, "副", "set", "toy", "🎧", "12-15"));
        list.add(new Item("phone_case", "手机壳", "Phone Case", 20.0, "个", "piece", "toy", "📱", "12-15"));
        list.add(new Item("mouse", "游戏鼠标", "Gaming Mouse", 45.0, "个", "piece", "toy", "🖱️", "12-15"));
        list.add(new Item("keyboard", "机械键盘", "Mechanical Keyboard", 100.0, "个", "piece", "toy", "⌨️", "12-15"));
        list.add(new Item("brand_tshirt", "品牌T恤", "Brand T-Shirt", 80.0, "件", "piece", "clothes", "👕", "12-15"));
        list.add(new Item("joggers", "运动裤", "Joggers", 90.0, "条", "piece", "clothes", "👖", "12-15"));
        list.add(new Item("watch", "运动手表", "Sports Watch", 150.0, "块", "piece", "clothes", "⌚", "12-15"));
        list.add(new Item("sunglasses", "太阳镜", "Sunglasses", 60.0, "副", "pair", "clothes", "🕶️", "12-15"));
        list.add(new Item("gel_pen_set", "中性笔套装", "Gel Pen Set", 8.0, "盒", "box", "stationery", "🖊️", "12-15"));
        list.add(new Item("calculator", "科学计算器", "Scientific Calculator", 35.0, "个", "piece", "stationery", "🔢", "12-15"));
        list.add(new Item("art_set", "美术套装", "Art Set", 40.0, "套", "set", "stationery", "🎨", "12-15"));
        list.add(new Item("highlighter", "荧光笔套装", "Highlighter Set", 12.0, "套", "set", "stationery", "🖍️", "12-15"));

        return list;
    }
}
