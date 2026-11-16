import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, Account, AccountRole } from '../../services/admin/admin.service';
import { getApiErrorMessage } from '../../services/api-error';

@Component({ selector: 'app-admin-accounts', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './admin-accounts.component.html' })
export class AdminAccountsComponent {
  private readonly service = inject(AdminService);
  role: AccountRole = 'clientes'; accounts: Account[] = []; errorMessage = ''; loading = false;
  editingId: number | null = null;
  draft: Record<string, unknown> = { identificacion: 0, nombre: '', direccion: '', email: '', password: '', id_ciudad: 1, rol: 'CLIENTE' };
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.service.list(this.role).subscribe({ next: (items) => { this.accounts = items; this.loading = false; }, error: (e) => { this.errorMessage = getApiErrorMessage(e) ?? 'No se pudieron cargar las cuentas.'; this.loading = false; } }); }
  changeRole(): void { this.load(); }
  edit(account: Account): void { this.editingId = account.identificacion; this.draft = { ...account, password: '' }; }
  cancelEdit(): void { this.editingId = null; this.draft = { identificacion: 0, nombre: '', direccion: '', email: '', password: '', id_ciudad: 1, rol: 'CLIENTE' }; }
  save(): void {
    this.errorMessage = '';
    const request = this.editingId === null ? this.service.create(this.role, this.draft) : this.service.update(this.role, this.editingId, this.draft);
    request.subscribe({ next: () => { this.cancelEdit(); this.load(); }, error: (e) => this.errorMessage = getApiErrorMessage(e) ?? 'No se pudo guardar la cuenta.' });
  }
  remove(account: Account): void { if (!confirm(`¿Eliminar la cuenta de ${account.nombre}?`)) return; this.service.remove(this.role, account.identificacion).subscribe({ next: () => this.load(), error: (e) => this.errorMessage = getApiErrorMessage(e) ?? 'No se pudo eliminar la cuenta.' }); }
}