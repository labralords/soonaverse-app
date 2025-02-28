/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { MemberApi } from '@api/member.api';
import { DeviceService } from '@core/services/device';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FILE_SIZES, Member, Timestamp, Transaction } from '@build-5/interfaces';
import { BehaviorSubject, first, Observable, of } from 'rxjs';
import { ROUTER_UTILS } from './../../../../@core/utils/router.utils';

@UntilDestroy()
@Component({
  selector: 'wen-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent implements OnDestroy {
  @Input() member?: Member;
  @Input() fullWidth?: boolean;
  @Input() allowMobileContent?: boolean;
  @Input() about?: string;
  @Input() role?: string;
  @Input() createdOn?: Timestamp;
  @Input() createdOnLabel = 'joined';
  public badges$: BehaviorSubject<Transaction[] | undefined> = new BehaviorSubject<
    Transaction[] | undefined
  >(undefined);
  public totalVisibleBadges = 6;
  public path = ROUTER_UTILS.config.member.root;
  public isReputationVisible = false;

  constructor(private memberApi: MemberApi, public deviceService: DeviceService) {
    // none.
  }

  public async refreshBadges(): Promise<void> {
    if (this.member?.uid) {
      this.memberApi
        .topBadges(this.member.uid)
        .pipe(first(), untilDestroyed(this))
        .subscribe(this.badges$);
    }
  }

  public getTotal(): Observable<number> {
    const stat = this.member?.spaces || {};
    let total = 0;
    for (const p in stat) {
      if (Object.prototype.hasOwnProperty.call(stat, p)) {
        total += stat[p].awardsCompleted || 0;
      }
    }

    return of(Math.trunc(total));
  }

  public get filesizes(): typeof FILE_SIZES {
    return FILE_SIZES;
  }

  public ngOnDestroy(): void {
    this.badges$.next(undefined);
  }
}
