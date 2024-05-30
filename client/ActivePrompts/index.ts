import Prompt, { PromptEntity, PromptGroup } from "clientTypes/prompt";
import PromptsBrowser from "client/index";
import { log } from "client/utils/index";

import reindexPromptGroups from "./reindexPromptGroups";
import getPromptByIndexInBranch from "./getPromptByIndexInBranch";
import insertPromptInBranch from "./insertPromptInBranch";
import removePromptInBranch from "./removePromptInBranch";

class ActivePrompts {

    public static getCurrentPrompts = () => {
        const {state} = PromptsBrowser;

        if(!state.currentPromptsList[state.currentContainer]) {
            state.currentPromptsList[state.currentContainer] = [];
        }
    
        return state.currentPromptsList[state.currentContainer];
    }

    public static setCurrentPrompts = (currentPrompts: PromptEntity[] = []) => {
        const {state} = PromptsBrowser;
        const {currentPromptsList, currentContainer} = state;
    
        currentPromptsList[currentContainer] = currentPrompts;
    }

    public static getPromptByIndex(index: number, groupId: number | false) {
        return getPromptByIndexInBranch({index, groupId});
    }

    //TODO: finish me
    public static getPromptById({id, groupId = false, currentGroupId = false, branch, terminator = 0}: {
        id: string;
        groupId?: number | false;
        currentGroupId?: number | false;
        branch?: PromptEntity[];
        terminator?: number;
    }): Prompt | false {
        if(terminator > 100) return false;
        if(!branch) branch = ActivePrompts.getCurrentPrompts();

        for(const branchItem of branch) {
            if("id" in branchItem && branchItem.id === id && groupId === currentGroupId) return branchItem;

            if(groupId !== false && "groupId" in branchItem) {
                const {prompts} = branchItem as PromptGroup;

                const result = ActivePrompts.getPromptById({
                    id,
                    branch: prompts,
                    terminator: terminator + 1
                });
                if(result && result.id === id) return result;
            }
        }

        return false;
    }

    public static removePrompt(index: number, groupId?: number | false) {
        removePromptInBranch({index, groupId});
        reindexPromptGroups();
    }

    public static insertPrompt(prompt: PromptEntity, index: number, groupId: number | false = false) {
        insertPromptInBranch({prompt, index, groupId});
        reindexPromptGroups();
    }

    public static movePrompt({from, to}: {
        from: {index: number; groupId: number | false};
        to: {index: number; groupId: number | false};
    }) {
        const fromElement = removePromptInBranch({...from});
        if(!fromElement || !fromElement[0]) return;

        ActivePrompts.insertPrompt(fromElement[0], to.index, to.groupId);
    }

}

export default ActivePrompts;
