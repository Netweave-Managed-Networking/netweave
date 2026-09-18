import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import * as d3 from 'd3';

interface RankItem {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  /** Top offset in px within the canvas track. 0 = canvas top = score 100. */
  top: number;
  dragging: boolean;
}

/**
 * Vertical ranking canvas.
 *
 * Four equal-height boxes live on a fixed-height track. Dragging a box up
 * or down moves it freely until it would overlap its neighbour. At that
 * point it "sticks" flush against the neighbour's near edge. If the
 * pointer then crosses the neighbour's vertical midpoint, the dragged box
 * and the neighbour swap positions outright (the neighbour takes the
 * dragged box's last resting spot, the dragged box lands on the far side
 * of the neighbour). This gives a continuous score (position on the
 * track) *and* a free-form rank (top-to-bottom order) from a single
 * gesture.
 */
@Component({
  selector: 'app-statement-ranker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statement-ranker.component.html',
  styleUrls: ['./statement-ranker.component.scss'],
})
export class StatementRankerComponent implements AfterViewInit, OnInit {
  @ViewChild('canvasTrack', { static: true })
  private canvasTrackRef!: ElementRef<HTMLDivElement>;

  @ViewChildren('boxEl')
  private boxEls!: QueryList<ElementRef<HTMLDivElement>>;

  /** Fixed track height in px. Tune freely; everything scales off this. */
  protected readonly canvasHeight = 600;

  /** Every box has this exact height in px. */
  protected readonly boxHeight = 64;

  protected readonly scaleTicks = [0, 25, 50, 75, 100];

  protected readonly statements: Pick<RankItem, 'id' | 'text'>[] = [
    {
      id: 'A',
      text: 'Entscheidungen sollten unter Beteiligung der Betroffenen entstehen und von einer tragfähigen gemeinsamen Lösung getragen werden.',
    },
    {
      id: 'B',
      text: 'Beteiligte sollten Freiräume haben, neue Vorgehensweisen eigenständig zu entwickeln und auszuprobieren.',
    },
    {
      id: 'C',
      text: 'Entscheidungen sollten konsequent danach getroffen werden, welche Option die vereinbarten Ziele am wirksamsten voranbringt.',
    },
    {
      id: 'D',
      text: 'Entscheidungen sollten anhand klarer Zuständigkeiten und nachvollziehbarer Verfahren getroffen werden.',
    },
  ];

  protected items: RankItem[] = [];

  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    // Start all boxes bunched together in the middle of the track, so the
    // first drag is what actually produces a meaningful score/rank.
    const stackHeight = this.statements.length * this.boxHeight;
    const startTop = (this.canvasHeight - stackHeight) / 2;

    this.items = this.statements.map((item, i) => ({
      ...item,
      top: startTop + i * this.boxHeight,
      dragging: false,
    }));
  }

  public ngAfterViewInit(): void {
    this.boxEls.forEach((elRef, index) => {
      this.attachDrag(elRef.nativeElement, this.items[index]);
    });
  }

  /** Score 0–100, 100 = top of the canvas = full approval. */
  protected scoreOf(item: RankItem): number {
    const travel = this.canvasHeight - this.boxHeight;
    return Math.round((1 - item.top / travel) * 100);
  }

  /** px position for a scale tick label (0–100), vertically centred. */
  protected tickTop(tick: number): number {
    return this.canvasHeight * (1 - tick / 100) - 7;
  }

  // ---------------------------------------------------------------------
  // Drag handling
  // ---------------------------------------------------------------------

  private attachDrag(el: HTMLDivElement, item: RankItem): void {
    const container = this.canvasTrackRef.nativeElement;
    let grabOffset = 0;

    const behavior = d3
      .drag<HTMLDivElement, unknown>()
      .container(container)
      .on(
        'start',
        (event: d3.D3DragEvent<HTMLDivElement, unknown, unknown>) => {
          item.dragging = true;
          grabOffset = event.y - item.top;
          this.cdr.detectChanges();
        },
      )
      .on('drag', (event: d3.D3DragEvent<HTMLDivElement, unknown, unknown>) => {
        const pointerY = event.y;
        const proposedTop = this.clamp(
          pointerY - grabOffset,
          0,
          this.canvasHeight - this.boxHeight,
        );
        this.resolveMove(item, proposedTop, pointerY);
        this.cdr.detectChanges();
      })
      .on('end', () => {
        item.dragging = false;
        this.cdr.detectChanges();
      });

    d3.select(el).call(behavior as any);
  }

  /**
   * Moves `dragged` towards `proposedTop`, but stops it flush against
   * whichever neighbour blocks the way. If the raw pointer position has
   * already passed that neighbour's midpoint, the two boxes swap places
   * instead of merely stopping.
   */
  private resolveMove(
    dragged: RankItem,
    proposedTop: number,
    pointerY: number,
  ): void {
    const order = this.getOrder();
    const idx = order.indexOf(dragged);
    const above = order[idx - 1]; // smaller top => higher score, physically above
    const below = order[idx + 1]; // larger top => lower score, physically below

    // Moving up into the neighbour above.
    if (above && proposedTop < above.top + this.boxHeight) {
      const stuckTop = above.top + this.boxHeight;
      const aboveMidpoint = above.top + this.boxHeight / 2;

      if (pointerY < aboveMidpoint) {
        const aboveOldTop = above.top;
        above.top = dragged.top; // neighbour takes the spot we last rested in
        dragged.top = aboveOldTop; // we land on the far side of the neighbour
      } else {
        dragged.top = stuckTop; // stick flush, no swap yet
      }
      return;
    }

    // Moving down into the neighbour below.
    if (below && proposedTop + this.boxHeight > below.top) {
      const stuckTop = below.top - this.boxHeight;
      const belowMidpoint = below.top + this.boxHeight / 2;

      if (pointerY > belowMidpoint) {
        const belowOldTop = below.top;
        below.top = dragged.top;
        dragged.top = belowOldTop;
      } else {
        dragged.top = stuckTop;
      }
      return;
    }

    // No collision: follow the pointer freely.
    dragged.top = proposedTop;
  }

  private getOrder(): RankItem[] {
    return [...this.items].sort((a, b) => a.top - b.top);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
