import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { first } from 'rxjs/operators';

import { ISpace } from '../../../../../core/cf-api.types';
import { ListView } from '../../../../../store/actions/list.actions';
import { selectManageUsersRoles } from '../../../../../store/actions/users.actions';
import { AppState } from '../../../../../store/app-state';
import { APIResource } from '../../../../../store/types/api.types';
import { ITableColumn } from '../../list-table/table.types';
import { IListConfig, ListViewTypes } from '../../list.component.types';
import { CfUsersSpaceRolesDataSourceService } from './cf-users-space-roles-data-source.service';
import { TableCellSpaceRoleComponent } from './table-cell-space-role/table-cell-space-role.component';

@Injectable()
export class CfUsersSpaceRolesListConfigService implements IListConfig<APIResource<ISpace>> {
  viewType = ListViewTypes.TABLE_ONLY;
  dataSource: CfUsersSpaceRolesDataSourceService;
  defaultView = 'table' as ListView;
  enableTextFilter = true;
  text = {
    title: null,
    filter: 'Search by name',
    noEntries: 'There are no spaces'
  };
  columns: ITableColumn<APIResource<ISpace>>[] = [{
    columnId: 'name',
    headerCell: () => 'Name',
    cellDefinition: {
      valuePath: 'entity.name'
    },
    sort: {
      type: 'sort',
      orderKey: 'name',
      field: 'entity.name'
    }
  }, {
    columnId: 'manager',
    headerCell: () => 'Manager',
    cellComponent: TableCellSpaceRoleComponent,
    cellConfig: {
      role: 'manager',
    }
  }, {
    columnId: 'auditor',
    headerCell: () => 'Auditor',
    cellComponent: TableCellSpaceRoleComponent,
    cellConfig: {
      role: 'auditor',
    }
  }, {
    columnId: 'developer',
    headerCell: () => 'Developer',
    cellComponent: TableCellSpaceRoleComponent,
    cellConfig: {
      role: 'developer',
    }
  }];
  initialised = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>, private cfGuid: string, private spaceGuid: string) {
    this.store.select(selectManageUsersRoles).pipe(
      first()
    ).subscribe(newRoles => {
      this.dataSource = new CfUsersSpaceRolesDataSourceService(cfGuid, newRoles.orgGuid, spaceGuid, this.store, this);
      this.initialised.next(true);
    });
  }

  getColumns = () => this.columns;
  getGlobalActions = () => [];
  getMultiActions = () => [];
  getSingleActions = () => [];
  getMultiFiltersConfigs = () => [];
  getDataSource = () => this.dataSource;
  public getInitialised = () => this.initialised;
}