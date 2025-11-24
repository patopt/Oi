
// Ported and adapted from provided JS
const easing: any = {
    easeOutCubic: function(pos: number) {
      return (Math.pow((pos-1), 3) +1);
    },
    easeOutQuart: function(pos: number) {
      return -(Math.pow((pos-1), 4) -1);
    },
  };
  
  export class IosSelector {
    options: any;
    halfCount: number;
    quarterCount: number;
    a: number;
    minV: number;
    selected: any;
    exceedA: number;
    moveT: number;
    moving: boolean;
    elems: any;
    events: any;
    itemHeight: number;
    itemAngle: number;
    radius: number;
    scroll: number;
    source: any[];
    value: any;
    onChange: any;
  
    constructor(options: any) {
      let defaults = {
        el: null, // Expecting DOM element, not selector string
        type: 'infinite', 
        count: 20,
        sensitivity: 0.8,
        source: [],
        value: null,
        onChange: null
      };
  
      this.options = Object.assign({}, defaults, options);
      this.options.count =  this.options.count - this.options.count % 4;
      Object.assign(this, this.options);
  
      this.halfCount = this.options.count / 2;
      this.quarterCount = this.options.count / 4;
      this.a = this.options.sensitivity * 10;
      this.minV = Math.sqrt(1 / this.a);
      this.selected = this.options.source[0];
  
      this.exceedA = 10;
      this.moveT = 0;
      this.moving = false;
  
      this.elems = {
        el: this.options.el,
        circleList: null,
        circleItems: null,
        highlight: null,
        highlightList: null,
        highListItems: null
      };
      
      this.events = {
        touchstart: null,
        touchmove: null,
        touchend: null
      };
  
      this.itemHeight = this.elems.el ? this.elems.el.offsetHeight * 3 / this.options.count : 30; // Fallback
      this.itemAngle = 360 / this.options.count;
      this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180);
      this.scroll = 0;
      this.source = this.options.source;

      if (this.elems.el) {
        this._init();
      }
    }
  
    _init() {
      this._create(this.options.source);
  
      let touchData: any = {
        startY: 0,
        yArr: []
      };
  
      for (let eventName in this.events) {
        this.events[eventName] = ((eventName) => {
          return (e: any) => {
            if (this.elems && this.elems.el && (this.elems.el.contains(e.target) || e.target === this.elems.el)) {
              e.preventDefault(); // Prevent default scroll
              if (this.source.length) {
                this['_' + eventName](e, touchData);
              }
            }
          };
        })(eventName);
      }
  
      if (this.elems.el) {
        this.elems.el.addEventListener('touchstart', this.events.touchstart);
        this.elems.el.addEventListener('mousedown', this.events.touchstart);
        this.elems.el.addEventListener('touchend', this.events.touchend);
      }
      document.addEventListener('mouseup', this.events.touchend);
      
      if (this.source.length) {
        this.value = this.value !== null ? this.value : this.source[0].value;
        this.select(this.value);
      }
    }
  
    _touchstart(e: any, touchData: any) {
      if (!this.elems || !this.elems.el) return;
      this.elems.el.addEventListener('touchmove', this.events.touchmove);
      document.addEventListener('mousemove', this.events.touchmove);
      let eventY = e.clientY || (e.touches && e.touches[0].clientY);
      touchData.startY = eventY;
      touchData.yArr = [[eventY, new Date().getTime()]];
      touchData.touchScroll = this.scroll;
      this._stop();
    }
  
    _touchmove(e: any, touchData: any) {
      let eventY = e.clientY || (e.touches && e.touches[0].clientY);
      touchData.yArr.push([eventY, new Date().getTime()]);
      if (touchData.length > 5) {
        touchData.yArr.shift(); 
      }
  
      let scrollAdd = (touchData.startY - eventY) / this.itemHeight;
      let moveToScroll = scrollAdd + this.scroll;
  
      if (this.options.type === 'normal') {
        if (moveToScroll < 0) {
          moveToScroll *= 0.3;
        } else if (moveToScroll > this.source.length) {
          moveToScroll = this.source.length + (moveToScroll - this.source.length) * 0.3;
        }
      } else {
        moveToScroll = this._normalizeScroll(moveToScroll);
      }
  
      touchData.touchScroll = this._moveTo(moveToScroll);
    }
  
    _touchend(e: any, touchData: any) {
      if (this.elems && this.elems.el) {
          this.elems.el.removeEventListener('touchmove', this.events.touchmove);
      }
      document.removeEventListener('mousemove', this.events.touchmove);
  
      let v;
  
      if (touchData.yArr.length === 1) {
        v = 0;
      } else {
        let startTime = touchData.yArr[touchData.yArr.length - 2][1];
        let endTime = touchData.yArr[touchData.yArr.length - 1][1];
        let startY = touchData.yArr[touchData.yArr.length - 2][0];
        let endY = touchData.yArr[touchData.yArr.length - 1][0];
  
        v = ((startY - endY) / this.itemHeight) * 1000 / (endTime - startTime);
        let sign = v > 0 ? 1 : -1;
        v = Math.abs(v) > 30 ? 30 * sign : v;
      }
  
      this.scroll = touchData.touchScroll;
      this._animateMoveByInitV(v);
    }
  
    _create(source: any[]) {
      if (!source.length || !this.elems || !this.elems.el) return;
  
      let template = `
        <div class="select-wrap">
          <ul class="select-options" style="transform: translate3d(0, 0, ${-this.radius}px) rotateX(0deg);">
            {{circleListHTML}}
          </ul>
          <div class="highlight">
            <ul class="highlight-list">
              {{highListHTML}}
            </ul>
          </div>
        </div>
      `;
  
      if (this.options.type === 'infinite') {
        let concatSource = [].concat(source as any);
        while (concatSource.length < this.halfCount) {
          concatSource = concatSource.concat(source as any);
        }
        source = concatSource;
      }
      this.source = source;
      let sourceLength = source.length;
  
      let circleListHTML = '';
      for (let i = 0; i < source.length; i++) {
        circleListHTML += `<li class="select-option"
                      style="
                        top: ${this.itemHeight * -0.5}px;
                        height: ${this.itemHeight}px;
                        line-height: ${this.itemHeight}px;
                        transform: rotateX(${-this.itemAngle * i}deg) translate3d(0, 0, ${this.radius}px);
                      "
                      data-index="${i}"
                      >${source[i].text}</li>`
      }
  
      let highListHTML = '';
      for (let i = 0; i < source.length; i++) {
        highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                          ${source[i].text}
                        </li>`
      }
  
      if (this.options.type === 'infinite') {
        for (let i = 0; i < this.quarterCount; i++) {
          circleListHTML = `<li class="select-option"
                        style="
                          top: ${this.itemHeight * -0.5}px;
                          height: ${this.itemHeight}px;
                          line-height: ${this.itemHeight}px;
                          transform: rotateX(${this.itemAngle * (i + 1)}deg) translate3d(0, 0, ${this.radius}px);
                        "
                        data-index="${-i - 1}"
                        >${source[sourceLength - i - 1].text}</li>` + circleListHTML;
          circleListHTML += `<li class="select-option"
                        style="
                          top: ${this.itemHeight * -0.5}px;
                          height: ${this.itemHeight}px;
                          line-height: ${this.itemHeight}px;
                          transform: rotateX(${-this.itemAngle * (i + sourceLength)}deg) translate3d(0, 0, ${this.radius}px);
                        "
                        data-index="${i + sourceLength}"
                        >${source[i].text}</li>`;
        }
  
        highListHTML = `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                            ${source[sourceLength - 1].text}
                        </li>` + highListHTML;
        highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">${source[0].text}</li>`
      }
  
      this.elems.el.innerHTML = template
                                  .replace('{{circleListHTML}}', circleListHTML)
                                  .replace('{{highListHTML}}', highListHTML);
                                  
      this.elems.circleList = this.elems.el.querySelector('.select-options');
      this.elems.circleItems = this.elems.el.querySelectorAll('.select-option');
      this.elems.highlight = this.elems.el.querySelector('.highlight');
      this.elems.highlightList = this.elems.el.querySelector('.highlight-list');
      this.elems.highlightitems = this.elems.el.querySelectorAll('.highlight-item');
  
      if (this.options.type === 'infinite') {
        this.elems.highlightList.style.top = -this.itemHeight + 'px';
      }
  
      this.elems.highlight.style.height = this.itemHeight + 'px';
      this.elems.highlight.style.lineHeight = this.itemHeight + 'px';
    }
  
    _normalizeScroll(scroll: number) {
      let normalizedScroll = scroll;
      while(normalizedScroll < 0) {
        normalizedScroll += this.source.length;
      }
      normalizedScroll = normalizedScroll % this.source.length;
      return normalizedScroll;
    }
  
    _moveTo(scroll: number) {
      if (!this.elems || !this.elems.el) return 0;
      if (this.options.type === 'infinite') {
        scroll = this._normalizeScroll(scroll);
      }
      this.elems.circleList.style.transform = `translate3d(0, 0, ${-this.radius}px) rotateX(${this.itemAngle * scroll}deg)`;
      this.elems.highlightList.style.transform = `translate3d(0, ${-(scroll) * this.itemHeight}px, 0)`;
  
      const items = Array.from(this.elems.circleItems) as HTMLElement[];
      items.forEach((itemElem: HTMLElement) => {
         const dataIndex = parseInt(itemElem.dataset.index || "0");
         if (Math.abs(dataIndex - scroll) > this.quarterCount) {
             itemElem.style.visibility = 'hidden';
         } else {
             itemElem.style.visibility = 'visible';
         }
      });
  
      return scroll;
    }
  
    async _animateMoveByInitV(initV: number) {
      let initScroll;
      let finalScroll;
  
      let totalScrollLen;
      let a;
      let t;
  
      if (this.options.type === 'normal') {
        if (this.scroll < 0 || this.scroll > this.source.length - 1) {
          a = this.exceedA;
          initScroll = this.scroll;
          finalScroll = this.scroll < 0 ? 0 : this.source.length - 1;
          totalScrollLen = initScroll - finalScroll;
  
          t = Math.sqrt(Math.abs(totalScrollLen / a));
          initV = a * t;
          initV = this.scroll > 0 ? -initV : initV;
          await this._animateToScroll(initScroll, finalScroll, t);
        } else {
          initScroll = this.scroll;
          a = initV > 0 ? -this.a : this.a;
          t = Math.abs(initV / a);
          totalScrollLen = initV * t + a * t * t / 2;
          finalScroll = Math.round(this.scroll + totalScrollLen);
          finalScroll = finalScroll < 0 ? 0 : (finalScroll > this.source.length - 1 ? this.source.length - 1 : finalScroll);
  
          totalScrollLen = finalScroll - initScroll;
          t = Math.sqrt(Math.abs(totalScrollLen / a));
          await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
        }
      } else {
        initScroll = this.scroll;
        a = initV > 0 ? -this.a : this.a;
        t = Math.abs(initV / a);
        totalScrollLen = initV * t + a * t * t / 2;
        finalScroll = Math.round(this.scroll + totalScrollLen);
        await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
      }
      
      this._selectByScroll(this.scroll);
    }
  
    _animateToScroll(initScroll: number, finalScroll: number, t: number, easingName: string = 'easeOutQuart') {
      if (initScroll === finalScroll || t === 0) {
        this._moveTo(initScroll);
        return;
      }
  
      let start = new Date().getTime() / 1000;
      let pass = 0;
      let totalScrollLen = finalScroll - initScroll;
      
      return new Promise<void>((resolve) => {
        this.moving = true;
        let tick = () => {
          pass = new Date().getTime() / 1000 - start;
  
          if (pass < t) {
            this.scroll = this._moveTo(initScroll + easing[easingName](pass / t) * totalScrollLen);
            this.moveT = requestAnimationFrame(tick);
          } else {
            resolve();
            this._stop();
            this.scroll = this._moveTo(initScroll + totalScrollLen);
          }
        };
        tick();
      });
    }
  
    _stop() {
      this.moving = false;
      cancelAnimationFrame(this.moveT);
    }
  
    _selectByScroll(scroll: number) {
      scroll = this._normalizeScroll(scroll) | 0;
      if (scroll > this.source.length - 1) {
        scroll = this.source.length - 1;
        this._moveTo(scroll);
      }
      this._moveTo(scroll);
      this.scroll = scroll;
      this.selected = this.source[scroll];
      this.value = this.selected.value;
      if (this.onChange) {
         this.onChange(this.selected);
      }
    }
  
    updateSource(source: any[]) {
      this._create(source);
      if (!this.moving) {
        this._selectByScroll(this.scroll);
      }
    }
  
    select(value: any) {
      for (let i = 0; i < this.source.length; i++) {
        if (this.source[i].value === value) {
          window.cancelAnimationFrame(this.moveT);
          let initScroll = this._normalizeScroll(this.scroll);
          let finalScroll = i;
          let t = Math.sqrt(Math.abs((finalScroll -  initScroll) / this.a));
          this._animateToScroll(initScroll, finalScroll, t);
          setTimeout(() => this._selectByScroll(i));
          return;
        }
      }
    }
  
    destroy() {
      this._stop();
      if (this.elems && this.elems.el) {
        this.elems.el.innerHTML = '';
        this.elems.el.removeEventListener('touchstart', this.events.touchstart);
        this.elems.el.removeEventListener('mousedown', this.events.touchstart);
        this.elems.el.removeEventListener('touchend', this.events.touchend);
      }
      document.removeEventListener('mouseup', this.events.touchend);
      document.removeEventListener('mousemove', this.events.touchmove);
      this.elems = null;
    }
  }