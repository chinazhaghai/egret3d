import Entity from "../core/Entity";
import Component from "../core/Component";
import { KEY_SERIALIZE, ISerializable, KEY_UUID } from "./types";

export { SerializeUtil };

class SerializeUtil {
    public static propertyHasGetterAndSetter(target: any, propName: string): boolean {
        let prototype = Object.getPrototypeOf(target);

        while (prototype) {
            const descriptror = Object.getOwnPropertyDescriptor(prototype, propName);
            if (descriptror && descriptror.get && descriptror.set) {
                return true;
            }

            prototype = Object.getPrototypeOf(prototype);
        }
        return false;
    }
    public static equal(source: any, target: any): boolean {
        const typeSource = typeof source;
        const typeTarget = typeof target;

        if (typeSource !== typeTarget) {
            return false;
        }

        if (source === null && target === null) {
            return true;
        }

        if (source === null || target === null) {
            return false;
        }

        switch (typeSource) {
            case "undefined":
            case "boolean":
            case "number":
            case "string":
            case "symbol":
            case "function":
                return source === target;

            case "object":
            default:
                break;
        }

        if (
            (Array.isArray(source) || ArrayBuffer.isView(source)) &&
            (Array.isArray(target) || ArrayBuffer.isView(target))
        ) {
            const sl = (source as any[]).length;
            if (sl !== (target as any[]).length) {
                return false;
            }

            if (sl === 0) {
                return true;
            }

            for (let i = 0; i < sl; ++i) {
                if (!this.equal((source as any[])[i], (target as any[])[i])) {
                    return false;
                }
            }

            return true;
        }

        if (source.constructor !== target.constructor) {
            return false;
        }

        if (
            // TODO: Asset
            // source instanceof Asset ||
            source instanceof Entity ||
            source instanceof Component
        ) {
            return source === target;
        }

        if (source.constructor === Object) {
            for (const k in source) {
                if (!this.equal(source[k], target[k])) {
                    return false;
                }
            }

            return true;
        }

        if (KEY_SERIALIZE in source) {
            return this.equal(
                (source as ISerializable).serialize(),
                (target as ISerializable).serialize()
            );
        }

        if (KEY_UUID in source) {
            return source.uuid === target.uuid;
        }

        throw new Error("Unsupported data.");
    }
}