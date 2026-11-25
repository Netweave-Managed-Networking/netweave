import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { MemberListItemDTO, PaginatedDTO } from '@netweave/api-types';
import { IconSearch } from '@netweave/icons';
import { firstValueFrom } from 'rxjs';
import { MemberListItemComponent } from '../member-list-item/member-list-item.component';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300; // waits for a pause in typing, so not every keystroke sends a request

/** overview of all members currently in the network, by name and paginated, searchable by name and email */
@Component({
  selector: 'app-members',
  imports: [IconSearch, MemberListItemComponent],
  templateUrl: './members.component.html',
})
export class MembersComponent {
  private http = inject(HttpClient);

  protected page = signal(1);
  protected searchInput = signal('');
  /** the search the list is loaded with, follows searchInput once typing pauses */
  protected search = signal('');

  // loaded on every visit, so newly added members show up right away
  protected membersResponse = resource({
    params: () => ({ page: this.page(), search: this.search() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.http.get<PaginatedDTO<MemberListItemDTO>>('/api/members', {
          params: {
            page: params.page,
            pageSize: PAGE_SIZE,
            ...(params.search && { search: params.search }),
          },
        }),
      ),
  });

  public constructor() {
    effect((onCleanup) => {
      const search = this.searchInput().trim();
      const timeout = setTimeout(() => {
        if (search === this.search()) return;
        // a new search starts over, its results may not even reach the current page
        this.page.set(1);
        this.search.set(search);
      }, SEARCH_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(timeout));
    });
  }

  // value() throws while the resource is in its error state
  private loadedPage = computed(() =>
    this.membersResponse.hasValue() ? this.membersResponse.value() : undefined,
  );

  protected members = computed(() => this.loadedPage()?.items ?? []);

  protected totalPages = computed(() => {
    const total = this.loadedPage()?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  });

  protected onSearchInput(event: Event) {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  protected previousPage() {
    this.page.update((page) => Math.max(1, page - 1));
  }

  protected nextPage() {
    this.page.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
