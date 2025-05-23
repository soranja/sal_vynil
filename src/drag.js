import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { setCurrentDraggedRecord, clearCurrentDraggedRecord, getSnappedRecord, records, metaOf } from './constants';

gsap.registerPlugin(Draggable);

const draggables = [];
const app = document.querySelector('#app');
const padding = 10; // make it less strict and more responsive (10 is good for laptops for example)

// Too overhead, possibly to write shorter?
let bounds = computeBounds();

window.addEventListener('resize', () => {
  bounds = computeBounds();
});

function computeBounds() {
  return {
    left: padding,
    top: padding,
    width: app.clientWidth - padding * 2,
    height: app.clientHeight - padding * 2,
  };
}

function clearDragFlags() {
  records.forEach((r) => {
    r.initDragged = false;
    r.readyDragged = false;
  });
}

export function disableAllDraggables() {
  draggables.forEach((draggable) => draggable.disable());
}
export function enableAllDraggables() {
  draggables.forEach((draggable) => draggable.enable());
}

export function initRecordDragging(recordWrapper) {
  const draggable = Draggable.create(recordWrapper, {
    type: 'x,y',
    bounds,
    // allowNativeTouchScrolling: false, // Not needed?

    onPress() {
      clearDragFlags();
      const meta = metaOf(this.target);
      meta.initDragged = meta.isInInitArea;
      meta.readyDragged = meta.isInReadyArea;
      setCurrentDraggedRecord(this.target);

      // Sets a init dragged record to scale x1.5 for visual distinction
      if (getSnappedRecord() !== this.target) {
        gsap.to(this.target, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
      }
    },

    onDrag() {
      const meta = metaOf(this.target);
      meta.currentPos = { x: this.x, y: this.y };

      if (meta.isInInitArea) meta.initDragged = true;
      if (meta.isInReadyArea) meta.readyDragged = true;
    },

    onDragEnd() {
      clearCurrentDraggedRecord();

      gsap.killTweensOf(this.target);
      gsap.set(this.target, { x: this.x, y: this.y });

      // Sets the init dragged record back to scale x1 if stayed in init area
      if (getSnappedRecord() !== this.target) {
        gsap.to(this.target, { scale: 1, duration: 0.4, ease: 'power2.out' });
      }
    },
  })[0];

  draggables.push(draggable);
  draggable.update(true);
  gsap.delayedCall(0, () => draggable.update(true));
}
