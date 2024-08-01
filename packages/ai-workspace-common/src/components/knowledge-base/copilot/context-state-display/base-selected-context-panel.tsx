import { useBuildThreadAndRun } from '@refly-packages/ai-workspace-common/hooks/use-build-thread-and-run';
import { useCopilotContextState } from '@refly-packages/ai-workspace-common/hooks/use-copilot-context-state';
import { useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { SearchTarget, useSearchStateStore } from '@refly-packages/ai-workspace-common/stores/search-state';
import { getQuickActionPrompt } from '@refly-packages/ai-workspace-common/utils/quickActionPrompt';
import { Button, Switch, Tag, Tooltip } from '@arco-design/web-react';
import { IconCloseCircle, IconFile, IconFolder, IconFontColors, IconRefresh } from '@arco-design/web-react/icon';
import { useGetSkills } from '@refly-packages/ai-workspace-common/skills/main-logic/use-get-skills';
import { useDispatchAction } from '@refly-packages/ai-workspace-common/skills/main-logic/use-dispatch-action';

interface BaseSelectedContextPanelProps {
  title: string;
  skillContent: React.ReactNode;
}

export const BaseSelectedContextPanel = (props: BaseSelectedContextPanelProps) => {
  const { title, skillContent } = props;
  const { currentSelectedText } = useCopilotContextState();
  const knowledgeBaseStore = useKnowledgeBaseStore();
  const { enableMultiSelect, currentSelectedContentList = [] } = knowledgeBaseStore;
  const searchStateStore = useSearchStateStore();

  // skill
  const [skills] = useGetSkills();

  return (
    <div className="context-state-card context-state-current-page">
      <div className="context-state-card-header">
        <div className="context-state-card-header-left">
          <IconFontColors />
          <span className="context-state-card-header-title">
            {title}{' '}
            {enableMultiSelect ? (
              <span style={{ color: '#00968F' }}>（共 {currentSelectedContentList.length} 个）</span>
            ) : (
              ``
            )}
          </span>
        </div>
        <div className="context-state-card-header-right">
          <Button
            type="text"
            className="assist-action-item"
            style={{ marginRight: 4 }}
            icon={
              <IconRefresh
                onClick={() => {
                  knowledgeBaseStore.resetSelectedContextState();
                }}
              />
            }
          ></Button>
          <Tooltip content="多选">
            <Switch
              type="round"
              size="small"
              checked={enableMultiSelect}
              onChange={(value) => {
                knowledgeBaseStore.updateEnableMultiSelect(value);
                if (currentSelectedContentList?.length === 0) {
                  knowledgeBaseStore.updateCurrentSelectedContentList([currentSelectedText]);
                }
              }}
            />
          </Tooltip>
          <Button
            type="text"
            className="assist-action-item"
            icon={
              <IconCloseCircle
                onClick={() => {
                  knowledgeBaseStore.updateSelectedText('');
                  searchStateStore.setSearchTarget(SearchTarget.CurrentPage);
                }}
              />
            }
          ></Button>
        </div>
      </div>
      <div className="context-state-card-body">
        {enableMultiSelect ? (
          currentSelectedContentList.map((item, index) => (
            <div className="context-state-resource-item">
              <Tag icon={<IconFontColors />} bordered className="context-state-resource-item-tag">
                {item}
              </Tag>
            </div>
          ))
        ) : (
          <div className="context-state-resource-item">
            <Tag icon={<IconFontColors />} bordered className="context-state-resource-item-tag">
              {currentSelectedText}
            </Tag>
          </div>
        )}
      </div>
      <div className="context-state-card-footer">{skillContent}</div>
    </div>
  );
};
