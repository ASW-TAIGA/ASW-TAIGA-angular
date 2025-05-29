// src/app/shared/services/modal.service.ts
import {
  Injectable,
  inject,
  Type,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
  ApplicationRef,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { Portal, ComponentPortal } from '@angular/cdk/portal';
import { take } from 'rxjs';
import { TailwindModalComponent } from '../ui/tailwind-modal/tailwind-modal.component';

export interface ModalConfig<T = any> {
  data?: T;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  panelClass?: string | string[];
  backdropClass?: string | string[];
}

export class ModalRef<T = any, R = any> {
  private componentRef: ComponentRef<T> | null = null;
  private overlayRef: OverlayRef | null = null;
  private modalContainerRef: ComponentRef<TailwindModalComponent> | null = null;

  constructor(
    private overlay: Overlay,
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {}

  /**
   * Opens a component inside the modal.
   * @param componentType The component to open inside the modal.
   * @param config Configuration for the modal.
   */
  open(
    componentType: Type<T>,
    config?: ModalConfig<any>
  ): Promise<R | undefined> {
    return new Promise((resolve) => {
      // Create the overlay
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically() as GlobalPositionStrategy, // Ensure type matches for global()
        hasBackdrop: true,
        backdropClass: config?.backdropClass || 'bg-black bg-opacity-50', // Tailwind backdrop
        panelClass: config?.panelClass,
        width: config?.width,
        height: config?.height,
        minWidth: config?.minWidth,
        minHeight: config?.minHeight,
        scrollStrategy: this.overlay.scrollStrategies.block(),
      });

      // Create the modal container component (TailwindModalComponent)
      this.modalContainerRef = this.overlayRef.attach(
        new ComponentPortal(TailwindModalComponent, null, this.injector)
      );

      // Pass configuration and context to the modal container
      this.modalContainerRef.instance.modalTitle =
        config?.data?.dialogTitle || 'Modal';

      // Create the component to be hosted inside the modal
      this.componentRef = createComponent(componentType, {
        environmentInjector: this.injector,
        hostElement: this.modalContainerRef.instance.modalContent.nativeElement,
      });

      // Pass initial data to the hosted component if available
      if (config?.data) {
        Object.assign(this.componentRef.instance as object, config.data);
      }

      // Attach the hosted component's view to the application's change detection
      this.appRef.attachView(this.componentRef.hostView);

      // Append the hosted component's DOM to the modal container
      this.modalContainerRef.instance.modalContent.nativeElement.appendChild(
        this.componentRef.location.nativeElement
      );

      // Subscribe to close events from the hosted component
      // Assuming the hosted component has an `afterClosed` or similar observable
      // For SettingFormDialogComponent, we'll implement a `close` method that emits
      (this.componentRef.instance as any).dialogRef = this; // Allow hosted component to close itself

      // Handle backdrop clicks to close the modal
      this.overlayRef
        .backdropClick()
        .pipe(take(1))
        .subscribe(() => this.close());

      // Expose a way for the hosted component to close itself
      this.modalContainerRef.instance.closeModal.subscribe(() => this.close());
    });
  }

  /**
   * Closes the modal and returns a result.
   * @param result The result to return from the modal.
   */
  close(result?: R): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
    if (this.modalContainerRef) {
      this.modalContainerRef.destroy();
      this.modalContainerRef = null;
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    // Resolve the promise from `open`
    (this as any)._resolvePromise(result); // Internal mechanism to resolve the promise
  }
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  // This is a workaround to simulate MatDialogRef's behavior
  // For the actual SettingFormDialogComponent, we'll need to define a `close` method on it
  // that `this.dialogRef.close(value)` can call.
  // We'll pass an instance of `ModalRef` as `dialogRef` to the component
  open<T, R = any>(
    componentType: Type<T>,
    config?: ModalConfig<any>
  ): Promise<R | undefined> {
    const modalRef = new ModalRef<T, R>(
      this.overlay,
      this.injector,
      this.appRef
    );
    // Attach a private method to resolve the promise that `ModalRef` returns
    // This allows the `close` method within `ModalRef` to trigger the promise resolution.
    let resolveFn: (value: R | undefined) => void;
    const promise = new Promise<R | undefined>((resolve) => {
      resolveFn = resolve;
    });
    (modalRef as any)._resolvePromise = resolveFn!;

    modalRef.open(componentType, config);
    return promise;
  }
}
