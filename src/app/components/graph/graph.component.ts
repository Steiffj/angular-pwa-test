import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Sigma } from 'sigma';
import { Settings } from 'sigma/settings';
import Graph from 'graphology';
import { NodeImageProgram } from '@sigma/node-image';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent implements AfterViewInit, OnDestroy {
  sigma?: Sigma;
  #graph: Graph = new Graph();
  @Input() set graph(value: Graph) {
    this.#graph = value;
    if (this.sigma) {
      this.sigma.setGraph(this.#graph);
    }
  }
  get graph() {
    return this.#graph;
  }

  #settings: Partial<Settings> = {
    defaultEdgeType: 'arrow',
    nodeProgramClasses: {
      image: NodeImageProgram,
    },
  };
  @Input() set settings(value: Partial<Settings>) {
    this.#settings = {
      ...this.#settings,
      ...value,
    };

    if (this.sigma) {
      for (const key of objectKeys(value)) {
        this.sigma.setSetting(key, value[key]!);
      }
    }
  }
  get settings() {
    return this.#settings;
  }

  @ViewChild('renderTarget') renderTarget!: ElementRef;
  @HostListener('contextmenu', ['$event'])
  preventCanvasContextMenu(event: Event) {
    event.preventDefault();
  }

  ngAfterViewInit() {
    this.sigma = new Sigma(
      this.graph,
      this.renderTarget.nativeElement,
      this.#settings
    );
  }

  ngOnDestroy() {
    this.sigma?.kill();
  }
}

const objectKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};
