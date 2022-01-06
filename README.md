# 多行文本省略 + 标签

## 0依赖

## 未来工作
- 补充e2e测试，保证覆盖一些极端情况的badcase

## 使用案例

![image](https://user-images.githubusercontent.com/30360513/148229362-f9a88bbf-ba42-4200-ba81-c8c86b2f8e29.png)

## 使用方法
HTML
```HTML
<style>
  #demo1 {
    width: 180px;
    max-height: 66px;
    overflow: hidden;
    background-color: blanchedalmond;
  }

  .tag {
    padding: 0 2px;
    font-size: 14px;
    background-color: chartreuse;
  }
</style>
<div id="demo1">
  <span id="text1"></span>
  <span class="tag">标签</span>
</div>
<script>
  var text = '这是一段只要两行的测试文案';
  text1.innerText = text;
  var c = window.getMultilineText({ dom: demo1, text, maxHeight: 66, tailPlaceHolder: 32, ellipsis: true });
  text1.innerText = c;
</script>
```

|  参数   | 类型  | 备注  |
|  ----  | ----  | ---- |
| dom  | HTMLElement | 包裹文字和标签的dom，相关的文字样式建议卸载外层，这个dom会被复制，计算字体 |
| text  | string | 需要计算的文案 |
| maxHeight  | number | 容器的最大高度 |
| tailPlaceHolder  | number | 尾部标签占据的宽度，不能超过单行宽度 |
| ellipsis  | bool \| undefined | 是否显示 ... |
