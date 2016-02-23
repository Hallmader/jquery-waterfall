# jquery-waterfall
jQuery瀑布流插件

    /*
     *配置参数
     *imgBox:box容器的类名
     *imgContent:img的父容器的类名
     *scrollInit:是否使用滚动加载
     *imagesData:数组。该数组每个元素均为一个对象。
     *	data:对象内部的图片集合对象，value为一数组，其中每个元素仍未对象，对应的value即为图片文件的名称。
     *imagesUrl:图片路径
     *stopPoint:中止滚动的点。该参数为一number类型。
     *initPoint:开始加载新图片的临界点。number类型。
     */

如果您的imagesData数据中的图片地址，是用Ajax从后台获取来的Json或其他数据（正常情况下是这样……），
抱歉本人至今还没有想到很好的办法提供一个Ajax接口，因此请您将get的图片列表转换成:
data: [{ src: '1.jpg' }, { src: '2.jpg' }, { src: '3.jpg' }……]的格式（我想这并不困难），再传入imagesData使用。

图片的样式完全可以自行改动，示例中仅做了极少数的样式修饰。
