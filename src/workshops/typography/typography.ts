import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import template from "./typography.html";
import { StyleService } from "../../styleService";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { TypographyContract, FontContract, ColorContract, ShadowContract } from "../../contracts";


const inheritLabel = "(Inherit)";

@Component({
    selector: "typography",
    template: template,
    injectable: "typography"
})
export class Typography {
    public fontKey: KnockoutObservable<any>;
    public fontSize: KnockoutObservable<any>;
    public fontWeight: KnockoutObservable<any>;
    public fontStyle: KnockoutObservable<any>;
    public colorKey: KnockoutObservable<any>;
    public shadowKey: KnockoutObservable<any>;
    public textAlign: KnockoutObservable<any>;
    public textTransform: KnockoutObservable<any>;
    public fontName: KnockoutObservable<string>;
    public colorName: KnockoutObservable<string>;
    public shadowName: KnockoutObservable<string>;

    public textTransformOptions = [
        { value: undefined, text: "(Inherit)" },
        { value: "capitalize", text: "Capitalize" },
        { value: "lowercase", text: "Lower-case" },
        { value: "uppercase", text: "Upper-case" }
    ];

    @Param()
    public typography: KnockoutObservable<TypographyContract>;

    @Event()
    public onUpdate: (contract: TypographyContract) => void;

    constructor(private readonly styleService: StyleService) {
        this.initialize = this.initialize.bind(this);
        this.onFontSelected = this.onFontSelected.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onShadowSelected = this.onShadowSelected.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
        this.toggleBold = this.toggleBold.bind(this);
        this.toggleItalic = this.toggleItalic.bind(this);

        this.typography = ko.observable();
        this.fontKey = ko.observable();
        this.fontSize = ko.observable();
        this.fontWeight = ko.observable();
        this.fontStyle = ko.observable();
        this.colorKey = ko.observable();
        this.shadowKey = ko.observable();
        this.textAlign = ko.observable();
        this.textTransform = ko.observable();
        this.fontName = ko.observable();
        this.colorName = ko.observable();
        this.shadowName = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const typography = this.typography();

        const styles = await this.styleService.getStyles();

        this.fontName(inheritLabel);
        this.colorName(inheritLabel);
        this.shadowName(inheritLabel);

        if (typography) {
            if (typography.fontKey) {
                const fontContract = Utils.getObjectAt<FontContract>(typography.fontKey, styles);
                this.fontName(fontContract.displayName);
                this.fontKey(typography.fontKey);
            }

            if (typography.colorKey) {
                const colorContract = Utils.getObjectAt<FontContract>(typography.colorKey, styles);
                this.colorName(colorContract.displayName);
                this.colorKey(typography.colorKey);
            }

            this.fontSize(typography.fontSize);
            this.fontWeight(typography.fontWeight);
            this.fontStyle(typography.fontStyle);
            this.textTransform(typography.textTransform);

            if (typography.shadowKey) {
                const shadowContract = Utils.getObjectAt<FontContract>(typography.shadowKey, styles);
                this.shadowName(shadowContract.displayName);
                this.shadowKey(typography.shadowKey);
            }

            this.textAlign(typography.textAlign);
        }

        this.fontKey.subscribe(this.applyChanges);
        this.fontWeight.subscribe(this.applyChanges);
        this.fontStyle.subscribe(this.applyChanges);
        this.fontSize.subscribe(this.applyChanges);
        this.colorKey.subscribe(this.applyChanges);
        this.shadowKey.subscribe(this.applyChanges);
        this.textAlign.subscribe(this.applyChanges);
        this.textTransform.subscribe(this.applyChanges);
    }

    public onFontSelected(fontContract: FontContract): void {
        this.fontName(fontContract ? fontContract.displayName : inheritLabel);
        this.fontKey(fontContract ? fontContract.key : undefined);
    }

    public onColorSelected(colorContract: ColorContract): void {
        this.colorName(colorContract ? colorContract.displayName : inheritLabel);
        this.colorKey(colorContract ? colorContract.key : undefined);
    }

    public onShadowSelected(shadowContract: ShadowContract): void {
        this.shadowName(shadowContract ? shadowContract.displayName : inheritLabel);
        this.shadowKey(shadowContract ? shadowContract.key : undefined);
    }

    public toggleBold(): void {
        const weight = this.fontWeight();
        this.fontWeight(weight !== "bold" ? "bold" : "normal");
    }

    public toggleItalic(): void {
        const style = this.fontStyle();
        this.fontStyle(style !== "italic" ? "italic" : "normal");
    }

    public alignLeft(): void {
        this.textAlign("left");
    }

    public alignCenter(): void {
        this.textAlign("center");
    }

    public alignRight(): void {
        this.textAlign("right");
    }

    public justify(): void {
        this.textAlign("justify");
    }

    private applyChanges(): void {
        if (this.onUpdate) {
            this.onUpdate({
                fontKey: this.fontKey(),
                fontSize: this.fontSize() ? parseInt(this.fontSize()) : undefined,
                fontWeight: this.fontWeight(),
                fontStyle: this.fontStyle(),
                colorKey: this.colorKey(),
                shadowKey: this.shadowKey(),
                textAlign: this.textAlign(),
                textTransform: this.textTransform()
            });
        }
    }
}