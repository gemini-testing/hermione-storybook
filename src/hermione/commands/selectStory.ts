import { STORYBOOK_PREVIEW, RE_METHOD_NOT_IMPLEMENTED } from "../constants";
import type { Args } from "@storybook/addons";

type SelectStoryFunction = (storyId: string, args?: Args) => Promise<void>;
declare global {
    interface Window {
        __HERMIONE_IS_STORY_RENDERED__: boolean;
    }
}

export function createSelectStory(storybookUrl: string): SelectStoryFunction {
    return async function (this: WebdriverIO.Browser, storyId: string, args: Args = {}): Promise<void> {
        let isStorybookApiInited = false;

        try {
            isStorybookApiInited = await this.execute<boolean, []>(function () {
                return Boolean(window.__HERMIONE_SELECT_STORY__);
            });
        } catch (err) {
            if (!RE_METHOD_NOT_IMPLEMENTED.test(err.message)) {
                throw err;
            }
        }

        if (!isStorybookApiInited) {
            let currUrl = "";

            try {
                currUrl = await this.getUrl();
            } catch (err) {
                if (!RE_METHOD_NOT_IMPLEMENTED.test(err.message)) {
                    throw err;
                }
            }

            const storybookIframeUrl = storybookUrl.includes(STORYBOOK_PREVIEW)
                ? storybookUrl
                : `${storybookUrl.replace(/\/$/, "")}/${STORYBOOK_PREVIEW}`;

            if (currUrl.includes(storybookIframeUrl)) {
                throw new Error("Hermione addon is not connected to storybook config");
            } else {
                await this.url(storybookIframeUrl);
            }
        }

        try {
            await this.executeAsync(
                function (storyId, args, doneCb) {
                    window.__HERMIONE_SELECT_STORY__(storyId, args, doneCb);
                },
                storyId,
                args,
            );
        } catch (err) {
            if (!RE_METHOD_NOT_IMPLEMENTED.test(err.message)) {
                throw err;
            }

            await this.execute(
                function (storyId, args) {
                    window.__HERMIONE_IS_STORY_RENDERED__ = false;

                    window.__HERMIONE_SELECT_STORY__(storyId, args, () => {
                        window.__HERMIONE_IS_STORY_RENDERED__ = true;
                    });
                },
                storyId,
                args,
            );

            await this.waitUntil(
                () => {
                    return this.execute(function () {
                        return window.__HERMIONE_IS_STORY_RENDERED__;
                    });
                },
                { timeoutMsg: `Story: "${storyId}" is not rendered` },
            );
        }

        const newUrl = await this.getUrl();
        await this.setMeta("url", newUrl);
    };
}
