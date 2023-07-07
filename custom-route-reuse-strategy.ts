import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router'
import { Router } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {

    private savedHandles = new Map<string, DetachedRouteHandle>(); 


    /** 
        Получить путь компонента
    **/
    private getRouteKey(route: ActivatedRouteSnapshot): string {
        return route.pathFromRoot.filter(u => u.url).map(u => u.url).join('/');
    }


    /** 
        Уничтожить компонент по ключу и удалить его из savedHandles
    **/
    public clearSavedHandle(key: string): void {
        const handle = this.savedHandles.get(key);
        if (handle) {
           (handle as any).componentRef.destroy();
        }
        this.savedHandles.delete(key);
    }

    /** 
        Уничтожить все компоненты и очистить savedHandles
    **/
    public clearSavedAllHandle(): void {
        for (const value of this.savedHandles.values()) {
            if (value) {
                (value as any).componentRef.destroy();
             }
        }
        this.savedHandles.clear();
    }
    /** 
        Находит сохраненный компоненты запрошенного маршрута, если он существует, то возвращает его
    **/
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.savedHandles.get(this.getRouteKey(route));
    }

    /** 
        Определяет, должен ли маршрут, к которому переместился пользователь, загрузить состояние компонента
        возвращает true, когда у нас есть сохраненный результат поиска  и вызывает retrieve
    **/
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return this.savedHandles.has(this.getRouteKey(route));
    }

    /** 
        Определяет, должен ли маршрут, с которого уходит пользователь, сохранять состояние компонента
        если возвращает true - вызывает метод store
    **/
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data.saveComponent;
    }

    /** 
        Срабатывает при навигации
        если возвращает true - повторно использует маршрут
        если возращает false - вызывает метод shouldDetach и shouldAttach
    **/
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        if (future.routeConfig === curr.routeConfig) {
            //Если предыдущий и текущий routeConfig равны и alwaysRefresh == true, то перезагружаем
            //Если предыдущий и текущий routeConfig равны и alwaysRefresh != true, повторно используем
            return !future.data.alwaysRefresh;
        } else {
            return false;
        }
    }

    /** 
        Сохраняет отсоединенный маршрут в savedHandles
    **/
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
        const key = this.getRouteKey(route);
        this.savedHandles.set(key, handle);
    }

}
