import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app-state';
import { EntityServiceFactory } from '../../core/entity-service-factory.service';
import { EntityService } from '../../core/entity-service';
import { EndpointSchema, GetAllCNSIS } from '../../store/actions/cnsis.actions';
import { Observable } from 'rxjs/Observable';
import { EntityInfo, APIResource } from '../../store/types/api.types';
import { switchMap, shareReplay, tap, filter, map } from 'rxjs/operators';
import { PaginationMonitorFactory } from '../../shared/monitors/pagination-monitor.factory';
import { PaginationMonitor } from '../../shared/monitors/pagination-monitor';
import { CNSISModel } from '../../store/types/cnsis.types';

@Injectable()
export class CloudFoundryService {
  cFEndpoints$: Observable<CNSISModel[]>;
  cfEndpointsMonitor: PaginationMonitor<CNSISModel>;
  waitForAppEntity$: Observable<EntityInfo<APIResource>>;

  constructor(
    private store: Store<AppState>,
    private paginationMonitorFactory: PaginationMonitorFactory
  ) {
    this.cfEndpointsMonitor = this.paginationMonitorFactory.create(
      'endpoint-list',
      EndpointSchema
    );

    this.cFEndpoints$ = this.cfEndpointsMonitor.currentPage$.pipe(
      map(endpoints => endpoints.filter(e => e.cnsi_type === 'cf')),
      shareReplay(1)
    );
  }
}
