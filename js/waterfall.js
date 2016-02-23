/*瀑布流布局插件 By Hallmader
 *传统的瀑布流布局实现方法，支持滚动加载新图片
 *这里的加载是不会无限次进行的，详细实现，请查看以下详情
 */

;
(function($) {
    /*单例模式实现
     *为避免全局变量污染，此处使用自执行函数将全部方法与类封锁保护
     *因其自执行返回的结果即WaterFall类，对其实例化的调用在顶层jQuery对象的方法内完成
     */
    var ClassBox = (function() {
        var WaterFall = function(element, config) {
            this.config = $.extend(true, $.fn.WaterFall.config, config);
            this.element = element;
            this.initCount = 0;

            this.init();
        };

        WaterFall.prototype = {
            /*预加载
             *此处加载渲染瀑布流布局
             *通过判断是否传入了scrollInit布尔值，判断是否执行滚动加载。
             */
            init: function() {
                var that = this;
                this.renderWaterFall();

                if (this.config.scrollInit) {
                    $(window).scroll(function() {
                        that.scrollInitImage();
                    });
                }

            },
            /*渲染瀑布流布局
             *原理与目前实现瀑布流的方法是完全相同的：
             *1、获取第一列图片中图片的张数；
             *2、获取其中高度最低图片的索引，并获取这一张图片的div元素；
             *3、将每张图片放置于高度最低图片的下方，同时将这一div元素的高度相加，最低高度的元素不再是它
             */
            renderWaterFall: function() {
                this.imgBox = this.element.find(this.config.imgBox);
                this.content = this.element.find(this.config.imgContent);

                var that = this;
                var number = Math.floor(this.element.width() / this.imgBox.eq(0).width());
                var boxArr = [];
                this.imgBox.each(function(index, el) {
                    if (index < number) {
                        boxArr[index] = $(el).height();
                    } else {
                        var minBoxHeight = Math.min.apply(null, boxArr);
                        var minBoxIndex = $.inArray(minBoxHeight, boxArr);
                        $(el).css({
                            'position': 'absolute',
                            'top': minBoxHeight,
                            'left': that.imgBox.eq(minBoxIndex).position().left
                        });
                        boxArr[minBoxIndex] += $(el).height();
                    }
                });
            },
            /*滚动加载的触发点
             *默认的触发点是最后一个div.box元素中点距离文档顶部之高度
             *当浏览器滚动高度+视口高度大于这一触发点高度后，即开启加载方法
             *这里可以传入一个指定的加载点，但不应该把这个点位设置得太大，否则浏览器滚动区域本身就没有那么多
             *另一个判断事件在于，如果设置了中止点，那么滚动高度超过这一中止点时，无论传入的图片有没有加载完毕，加载都会中止
             */
            scrollFlag: function() {
                var lastBox = this.imgBox.last();
                var lastBoxHeight = lastBox.offset().top + Math.floor(lastBox.height() / 2);
                var windowHeight = $(window).scrollTop() + $(window).height();
                this.stopPoint = this.config.stopPoint;
                if (this.stopPoint) {
                    if (windowHeight > this.stopPoint) {
                        return false;
                    }
                }
                return (windowHeight > (this.config.initPoint || lastBoxHeight)) ? true : false;
            },
            /*滚动加载事件
             *每一次执行该事件，即会创建一个div.box容器与其子元素，同时调用瀑布流渲染方法，确保它们均是瀑布流布局方式
             *需要加载的图片src地址是从传入的参数中获取的。
             *
             *让我来解释一下为什么会有一个initCount属性。
             *一般的瀑布流布局在这里都会有一个无限加载的情况，但这与实际场景必然是不符合的。
             *这里本人使用了一个较为取巧的办法，每一次将新图片加载完毕，initCount数字将会自加一次，
             *方法内部将会利用这个数字，取得imagesData数组中对应索引的图片地址集合。
             *下一次执行时，initCount发生改变，就会获取另一组集合。
             *但一旦发现这个数字对应的数组元素在imagesData数组中根本不存在，该函数将会直接跳出，不再继续执行。
             *因此，到底执行多少次加载，取决于您的imagesData数组到底有几个图片地址集合元素。
             */
            scrollInitImage: function() {
                var that = this;
                if (!this.config.imagesData[this.initCount]) {
                    return false;
                }
                this.data = this.config.imagesData[this.initCount].data;
                if (this.scrollFlag()) {
                    $.each(this.data, function(index, el) {
                        var oImg = $("<img></img>").attr('src', that.config.imagesUrl + el.src);
                        var oBox = $("<div></div>").addClass(that.config.imgBox.substring(1));
                        var oContent = $("<div></div>").addClass(that.config.imgContent.substring(1));
                        that.element.append(oBox);
                        oBox.append(oContent);
                        oContent.append(oImg);
                    });
                    that.renderWaterFall();
                    this.initCount++;
                }
            },

        };
        return WaterFall;
    })();
    /*jQuery原型方法进行加载
     *考虑到具体的使用方法，任何一个jquery对象都可以调用它。
     *但是，这个类有且仅有一个。这里是使用了单例模式。因为我认为不可能有一个页面中出现2个以上瀑布流的情况。
     */
    $.fn.WaterFall = function(config) {
        return $(this).each(function() {
            var waterFall = $(this).data('waterFall');
            if (!waterFall) {
                waterFall = new ClassBox($(this), config);
                $(this).data('waterFall', waterFall);
            }
            return waterFall;
        });
    };
    /*配置参数
     *imgBox:box容器的类名
     *imgContent:img的父容器的类名
     *scrollInit:是否使用滚动加载
     *imagesData:数组。该数组每个元素均为一个对象。
     *	data:对象内部的图片集合对象，value为一数组，其中每个元素仍未对象，对应的value即为图片文件的名称。
     *imagesUrl:图片路径
     *stopPoint:中止滚动的点。该参数为一number类型。
     *initPoint:开始加载新图片的临界点。number类型。
     */
    $.fn.WaterFall.config = {
        imgBox: ".box",
        imgContent: '.content',
        scrollInit: true,
        imagesData: [{
            data: [{ src: '1.jpg' }, { src: '2.jpg' }, { src: '3.jpg' }, { src: '4.jpg' }, { src: '5.jpg' }, { src: '6.jpg' }, { src: '7.jpg' }, { src: '8.jpg' }, { src: '9.jpg' }, { src: '10.jpg' }]
        }, {
            data: [{ src: '11.jpg' }, { src: '12.jpg' }, { src: '13.jpg' }, { src: '14.jpg' }, { src: '15.jpg' }, { src: '16.jpg' }, { src: '17.jpg' }, { src: '18.jpg' }, { src: '19.jpg' }, { src: '20.jpg' }]
        }],
        imagesUrl: 'images/',
        stopPoint: '',
        initPoint: ''
    };
})(jQuery);

/*
 *如果您的imagesData数据中的图片地址，是用Ajax从后台获取来的Json或其他数据（正常情况下是这样……），
 *抱歉本人至今还没有想到很好的办法提供一个Ajax接口，因此请您将get的图片列表转换成:
 *data: [{ src: '1.jpg' }, { src: '2.jpg' }, { src: '3.jpg' }……]的格式（我想这并不困难），再传入imagesData使用。
 */


