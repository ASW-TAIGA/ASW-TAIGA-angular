// src/app/issues/ui/user-management/user-management.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'; // Ensure all are imported
import { CommonModule } from '@angular/common';
import { UserLite } from '../../data-access/issue.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  // styleUrls: ['./user-management.component.css'] // Ensure this file exists if uncommented
})
export class UserManagementComponent implements OnChanges {
  @Input() title: string = 'Users';
  @Input() selectedUsers: UserLite[] = [];
  @Input() allProjectUsers: UserLite[] = [];
  @Input() currentUser!: UserLite; // Changed from @Input_
  @Input() addMeText: string = 'Assign to me';
  @Input() removeMeText: string = 'Unassign me';
  @Input() addExistingText: string = '+ Add user';
  @Input() allowMultiple: boolean = true;

  @Output() userAdded = new EventEmitter<UserLite>();
  @Output() userRemoved = new EventEmitter<UserLite>();
  @Output() currentUserToggled = new EventEmitter<boolean>();

  isCurrentUserSelected: boolean = false;
  showUserListDropdown: boolean = false;
  availableUsersForDropdown: UserLite[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentUser && this.selectedUsers) { // Check if currentUser and selectedUsers are defined
      this.updateCurrentUserSelectedState();
    }
    if (this.allProjectUsers && this.selectedUsers) { // Check if allProjectUsers and selectedUsers are defined
      this.updateAvailableUsersForDropdown();
    }
  }

  updateCurrentUserSelectedState(): void {
    if (this.currentUser && this.selectedUsers) {
      this.isCurrentUserSelected = this.selectedUsers.some(user => user.id === this.currentUser.id);
    } else {
      this.isCurrentUserSelected = false;
    }
  }

  updateAvailableUsersForDropdown(): void {
    if (this.allProjectUsers && this.selectedUsers) {
      this.availableUsersForDropdown = this.allProjectUsers.filter(
        projUser => !this.selectedUsers.some(selUser => selUser.id === projUser.id)
      );
    } else {
      this.availableUsersForDropdown = this.allProjectUsers || [];
    }
  }

  toggleCurrentUser(): void {
    this.currentUserToggled.emit(!this.isCurrentUserSelected);
  }

  removeUser(user: UserLite): void {
    this.userRemoved.emit(user);
  }

  addUserFromDropdown(user: UserLite): void {
    if (!this.allowMultiple) {
      if (this.selectedUsers.length > 0 && this.selectedUsers[0].id !== user.id) {
        this.userRemoved.emit(this.selectedUsers[0]);
      } else if (this.selectedUsers.length > 0 && this.selectedUsers[0].id === user.id) {
        this.showUserListDropdown = false;
        return;
      }
    }
    this.userAdded.emit(user);
    this.showUserListDropdown = false;
  }

  toggleUserListDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.updateAvailableUsersForDropdown(); // Ensure list is fresh before showing
    this.showUserListDropdown = !this.showUserListDropdown;
  }
}
