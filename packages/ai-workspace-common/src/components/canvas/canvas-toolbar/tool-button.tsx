import { memo, FC } from 'react';
import { Button, Badge } from 'antd';
import TooltipWrapper from '@refly-packages/ai-workspace-common/components/common/tooltip-button';
import { HoverCard, HoverContent } from '@refly-packages/ai-workspace-common/components/hover-card';

export type ToolValue =
  | 'askAI'
  | 'createMemo'
  | 'importResource'
  | 'addResource'
  | 'createDocument'
  | 'addDocument'
  | 'handleLaunchpad'
  | 'showEdges';

// Define toolbar item interface
export interface ToolbarItem {
  type: 'button' | 'popover' | 'divider';
  icon?: React.ElementType;
  value?: ToolValue;
  domain?: string;
  tooltip?: string;
  active?: boolean;
  isPrimary?: boolean;
  hoverContent?: HoverContent;
}

interface ToolButtonProps {
  tool: ToolbarItem;
  contextCnt: number;
  handleToolSelect: (event: React.MouseEvent, tool: string) => void;
  getIconColor: (tool: string) => string;
  getIsLoading: (tool: string) => boolean;
}

export const ToolButton: FC<ToolButtonProps> = memo(
  ({
    tool,
    contextCnt = 0,
    handleToolSelect,
    getIconColor,
    getIsLoading,
  }: {
    tool: ToolbarItem;
    contextCnt?: number;
    handleToolSelect: (event: React.MouseEvent, tool: string) => void;
    getIconColor: (tool: string) => string;
    getIsLoading: (tool: string) => boolean;
  }) => {
    const button =
      contextCnt > 0 && tool.value === 'handleLaunchpad' ? (
        <Badge size="small" color="#00968F" offset={[-2, 2]} count={contextCnt} overflowCount={9999}>
          <Button
            type="text"
            onClick={(event) => handleToolSelect(event, tool.value as string)}
            className={`
              h-[32px] w-[32px] 
              flex items-center justify-center 
              hover:bg-gray-100 rounded-lg 
              transition-colors duration-200 
              group
              ${tool.active ? 'bg-gray-100' : ''}
            `}
            icon={
              <tool.icon
                className={`h-[18px] w-[18px] text-gray-600 group-hover:text-gray-900 ${tool.isPrimary ? 'text-primary-600' : ''}`}
                style={{ color: getIconColor(tool.value as string) }}
              />
            }
            loading={getIsLoading(tool.value as string)}
          />
        </Badge>
      ) : (
        <Button
          data-tour={tool.value === 'askAI' ? 'ask-ai' : undefined}
          type="text"
          onClick={(event) => handleToolSelect(event, tool.value as string)}
          className={`
            h-[32px] w-[32px] 
            flex items-center justify-center 
            hover:bg-gray-100 rounded-lg 
            transition-colors duration-200 
            group
            ${tool.active ? 'bg-gray-100' : ''}
          `}
          icon={
            <tool.icon
              className={`h-[18px] w-[18px] text-gray-600 group-hover:text-gray-900 ${tool.isPrimary ? 'text-primary-600' : ''}`}
              style={{ color: getIconColor(tool.value as string) }}
            />
          }
          loading={getIsLoading(tool.value as string)}
        />
      );

    return tool.hoverContent ? (
      <HoverCard
        title={tool.hoverContent.title}
        description={tool.hoverContent.description}
        videoUrl={tool.hoverContent.videoUrl}
        placement="right"
        overlayStyle={{ marginLeft: '12px' }}
        align={{ offset: [12, 0] }}
      >
        {button}
      </HoverCard>
    ) : (
      <TooltipWrapper tooltip={tool.tooltip}>{button}</TooltipWrapper>
    );
  },
);
