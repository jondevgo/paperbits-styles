import * as Utils from "@paperbits/common/utils";
import { IStyleService, BreakpointValues } from "@paperbits/common/styles";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract } from "./contracts";

const stylesPath = "styles";

export class StyleService implements IStyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly eventManager: IEventManager
    ) { }

    private isResponsive(variation: Object): boolean {
        return Object.keys(variation).some(x => Object.keys(BreakpointValues).includes(x));
    }

    public async getStyles(): Promise<ThemeContract> {
        // console.log(JSON.stringify(config));
        // return config;
        return await this.objectStorage.getObject<ThemeContract>(stylesPath);
    }

    public getClassNamesByStyleConfig(styleConfig: any): string {
        const classNames = [];

        for (const category of Object.keys(styleConfig)) {
            const categoryConfig = styleConfig[category];

            if (!categoryConfig) {
                return;
            }

            if (this.isResponsive(categoryConfig)) {
                for (const breakpoint of Object.keys(categoryConfig)) {
                    let className;

                    if (breakpoint === "xs") {
                        className = this.getClassNameByStyleKey(categoryConfig[breakpoint]);
                    }
                    else {
                        className = this.getClassNameByStyleKey(categoryConfig[breakpoint], breakpoint);
                    }

                    if (className) {
                        classNames.push(className);
                    }
                }
            }
            else {
                const className = this.getClassNameByStyleKey(categoryConfig);

                if (className) {
                    classNames.push(className);
                }
            }
        }

        return classNames.join(" ");
    }

    public getClassNameByStyleKey(key: string, breakpoint?: string): string {
        const segments = key.split("/");
        const component = segments[1];
        const componentVariation = segments[2];
        const classNames = [];

        classNames.push(Utils.camelCaseToKebabCase(component));

        if (componentVariation) {
            let className;

            if (breakpoint) {
                className = `${component}-${breakpoint}-${componentVariation}`;
            }
            else {
                className = `${component}-${componentVariation}`;
            }

            className = Utils.camelCaseToKebabCase(className);
            classNames.push(className);
        }

        // TODO: Consider a case: components/navbar/default/components/navlink

        return classNames.join(" ");
    }

    public async getColorByKey(colorKey: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(colorKey, styles);
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newColor = Utils.clone(styles["colors"]["default"]);
        newColor.key = `colors/${variationName}`;

        styles["colors"][variationName] = newColor;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addComponentVariation(componentName: string, variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const newVariation = Utils.clone(styles["components"][componentName]["default"]);
        newVariation.key = `components/${componentName}/${variationName}`;

        styles["components"][componentName][variationName] = newVariation;

        this.updateStyles(styles);

        return `components/${componentName}/${variationName}`;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async updateStyle(style): Promise<void> {
        this.objectStorage.updateObject(`${stylesPath}/${style.key}`, style);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async getVariations<TVariation>(categoryName: string): Promise<TVariation[]> {
        const styles = await this.getStyles();

        const variations = Object.keys(styles[categoryName]).map(variationName => {
            const variationContract = styles[categoryName][variationName];
            return variationContract;
        });

        return variations;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            return variationContract;
        });

        return variations;
    }

    public async setInstanceStyle(instanceKey: string, instanceStyles: Object): Promise<void> {
        const styles = await this.getStyles();
        Utils.mergeDeepAt(instanceKey, styles, instanceStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(styleKey, styles);
    }
}