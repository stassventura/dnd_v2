import { Item, ItemField } from '../types';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface useDragProps {
  columns: string[];
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  activeColumn: string | null | number;
  activeTask: Item | null;
  setActiveColumn: React.Dispatch<React.SetStateAction<string | null | number>>;
  setActiveTask: React.Dispatch<React.SetStateAction<Item | null>>;
  itemField: ItemField;
}

const useDrag = ({
  columns,
  setColumns,
  items,
  setItems,
  activeColumn,
  activeTask,
  setActiveColumn,
  setActiveTask,
  itemField,
}: useDragProps) => {
  const onDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type;
    if (type === 'Column') {
      const id = event.active.id;
      return setActiveColumn(id);
    }
    if (type === 'Task') {
      return setActiveTask(event.active.data.current?.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeTask) return;

    const activeColumnIndex = columns.findIndex((col) => col === activeColumnId);
    const overColumnIndex = columns.findIndex((col) => col === overColumnId);

    const updatedColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
    setColumns(updatedColumns);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    if (active.data.current?.type !== 'Task') return;

    const activeIndex = items.findIndex((t) => t.id === activeId);
    const overIndex = items.findIndex((item) => item.id === overId);
    const updatedTasks: Item[] = [...items];

    if (over.data.current?.type === 'Task') {
      if (items[activeIndex][itemField] !== items[overIndex][itemField]) {
        (updatedTasks[activeIndex][itemField as keyof Item] as string | number) =
          items[overIndex][itemField as keyof Item];
        updatedTasks.splice(activeIndex, 1);
        updatedTasks.splice(overIndex, 0, items[activeIndex]);
      } else {
        const reorderedTasks = arrayMove(updatedTasks, activeIndex, overIndex);
        setItems(reorderedTasks);
        return;
      }
    } else if (over.data.current?.type === 'Column') {
      const taskToMove = { ...items[activeIndex] };
      (taskToMove[itemField as keyof Item] as string | number) = String(overId);
      updatedTasks.splice(activeIndex, 1);
      updatedTasks.push(taskToMove);
    }

    setItems(updatedTasks);
  };

  return {
    onDragStart,
    onDragEnd,
    onDragOver,
    activeColumn,
    activeTask,
  };
};

export default useDrag;
