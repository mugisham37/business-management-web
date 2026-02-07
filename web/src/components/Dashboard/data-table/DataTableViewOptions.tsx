"use client"

import React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { Column, Table } from "@tanstack/react-table"

import ReactDOM from "react-dom"
import invariant from "tiny-invariant"

import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { cx } from "@/lib/utils"
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash"
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import * as liveRegion from "@atlaskit/pragmatic-drag-and-drop-live-region"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { RiDraggable, RiEqualizer2Line } from "@remixicon/react"

type CleanupFn = () => void

type ItemEntry = { itemId: string; element: HTMLElement }

type ListContextValue = {
  getListLength: () => number
  registerItem: (entry: ItemEntry) => CleanupFn
  reorderItem: (args: {
    startIndex: number
    indexOfTarget: number
    closestEdgeOfTarget: Edge | null
  }) => void
  instanceId: symbol
}

const ListContext = React.createContext<ListContextValue | null>(null)

function useListContext() {
  const listContext = React.useContext(ListContext)
  invariant(listContext !== null)
  return listContext
}

type Item = {
  id: string
  label: string
}

const itemKey = Symbol("item")

type ItemData = {
  [itemKey]: true
  item: Item
  index: number
  instanceId: symbol
}

function getItemData({
  item,
  index,
  instanceId,
}: {
  item: Item
  index: number
  instanceId: symbol
}): ItemData {
  return {
    [itemKey]: true,
    item,
    index,
    instanceId,
  }
}

function isItemData(data: Record<string | symbol, unknown>): data is ItemData {
  return data[itemKey] === true
}

type DraggableState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" }

const idleState: DraggableState = { type: "idle" }
const draggingState: DraggableState = { type: "dragging" }

function ListItem({
  item,
  index,
  column,
}: {
  item: Item
  index: number
  column: Column<any, unknown> | undefined
}) {
  const { registerItem, instanceId, reorderItem, getListLength } = useListContext()

  const ref = React.useRef<HTMLDivElement>(null)
  const [closestEdge, setClosestEdge] = React.useState<Edge | null>(null)

  const dragHandleRef = React.useRef<HTMLButtonElement>(null)

  const [draggableState, setDraggableState] =
    React.useState<DraggableState>(idleState)
  
  const [isReordering, setIsReordering] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    const dragHandle = dragHandleRef.current
    invariant(element)
    invariant(dragHandle)

    const data = getItemData({ item, index, instanceId })

    return combine(
      registerItem({ itemId: item.id, element }),
      draggable({
        element: dragHandle,
        getInitialData: () => data,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setIsReordering(true)
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "10px",
              y: "10px",
            }),
            render({ container }) {
              setDraggableState({ type: "preview", container })

              return () => setDraggableState(draggingState)
            },
          })
        },
        onDragStart() {
          setDraggableState(draggingState)
          setIsReordering(true)
        },
        onDrop() {
          setDraggableState(idleState)
          setIsReordering(false)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return (
            isItemData(source.data) && source.data.instanceId === instanceId
          )
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        onDrag({ self, source }) {
          const isSource = source.element === element
          if (isSource) {
            setClosestEdge(null)
            return
          }

          const closestEdge = extractClosestEdge(self.data)

          const sourceIndex = source.data.index
          invariant(typeof sourceIndex === "number")

          const isItemBeforeSource = index === sourceIndex - 1
          const isItemAfterSource = index === sourceIndex + 1

          const isDropIndicatorHidden =
            (isItemBeforeSource && closestEdge === "bottom") ||
            (isItemAfterSource && closestEdge === "top")

          if (isDropIndicatorHidden) {
            setClosestEdge(null)
            return
          }

          setClosestEdge(closestEdge)
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      }),
    )
  }, [instanceId, item, index, registerItem])

  return (
    <React.Fragment>
      <div ref={ref} className="relative border-b border-transparent">
        <div
          className={cx(
            "relative flex items-center justify-between gap-2 rounded-sm transition-colors",
            draggableState.type === "dragging" && "opacity-50",
            isFocused && "sort-button-base sort-button-active",
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={column?.getIsVisible()}
              onCheckedChange={() => column?.toggleVisibility()}
              disabled={!column?.getCanHide()}
              aria-label={`Toggle ${item.label} column visibility`}
            />
            <Label 
              className="cursor-pointer select-none"
              disabled={!column?.getCanHide()}
              onClick={() => column?.getCanHide() && column?.toggleVisibility()}
            >
              {item.label}
            </Label>
          </div>
          <Button
            aria-hidden="true"
            tabIndex={-1}
            variant="ghost"
            size="icon"
            className="-mr-1 px-0 py-1 h-6 w-6"
            ref={dragHandleRef}
            aria-label={`Reorder ${item.label}`}
            disabled={isReordering}
            isLoading={isReordering}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' && index > 0) {
                e.preventDefault()
                reorderItem({
                  startIndex: index,
                  indexOfTarget: index - 1,
                  closestEdgeOfTarget: 'top'
                })
              } else if (e.key === 'ArrowDown' && index < getListLength() - 1) {
                e.preventDefault()
                reorderItem({
                  startIndex: index,
                  indexOfTarget: index + 1,
                  closestEdgeOfTarget: 'bottom'
                })
              }
            }}
          >
            <RiDraggable className="size-4 text-gray-400 dark:text-gray-600" />
          </Button>
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
      </div>
      {draggableState.type === "preview" &&
        ReactDOM.createPortal(
          <div>{item.label}</div>,
          draggableState.container,
        )}
    </React.Fragment>
  )
}

function getItemRegistry() {
  const registry = new Map<string, HTMLElement>()

  function register({ itemId, element }: ItemEntry) {
    registry.set(itemId, element)

    return function unregister() {
      registry.delete(itemId)
    }
  }

  function getElement(itemId: string): HTMLElement | null {
    return registry.get(itemId) ?? null
  }

  return { register, getElement }
}

type ListState = {
  items: Item[]
  lastCardMoved: {
    item: Item
    previousIndex: number
    currentIndex: number
    numberOfItems: number
  } | null
}

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

function ViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const tableColumns: Item[] = table.getAllColumns()
    .filter(column => column.columnDef.meta?.displayName)
    .map((column) => ({
      id: column.id,
      label: column.columnDef.meta?.displayName as string,
    }))
  const [{ items, lastCardMoved }, setListState] = React.useState<ListState>({
    items: tableColumns,
    lastCardMoved: null,
  })
  const [registry] = React.useState(getItemRegistry)
  const [isReordering, setIsReordering] = React.useState(false)

  const [instanceId] = React.useState(() => Symbol("instance-id"))

  React.useEffect(() => {
    table.setColumnOrder(items.map((item) => item.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const reorderItem = React.useCallback(
    ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number
      indexOfTarget: number
      closestEdgeOfTarget: Edge | null
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: "vertical",
      })

      if (finishIndex === startIndex) {
        return
      }

      setIsReordering(true)
      setListState((listState) => {
        const item = listState.items[startIndex]

        return {
          items: reorder({
            list: listState.items,
            startIndex,
            finishIndex,
          }),
          lastCardMoved: {
            item,
            previousIndex: startIndex,
            currentIndex: finishIndex,
            numberOfItems: listState.items.length,
          },
        }
      })
      
      setTimeout(() => setIsReordering(false), 150)
    },
    [],
  )

  React.useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data
        const targetData = target.data
        if (!isItemData(sourceData) || !isItemData(targetData)) {
          return
        }

        const indexOfTarget = items.findIndex(
          (item) => item.id === targetData.item.id,
        )
        if (indexOfTarget < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceData.index,
          indexOfTarget,
          closestEdgeOfTarget,
        })
      },
    })
  }, [instanceId, items, reorderItem])

  // once a drag is finished, we have some post drop actions to take
  React.useEffect(() => {
    if (lastCardMoved === null) {
      return
    }

    const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved
    const element = registry.getElement(item.id)
    if (element) {
      triggerPostMoveFlash(element)
    }

    liveRegion.announce(
      `You've moved ${item.label} from position ${previousIndex + 1
      } to position ${currentIndex + 1} of ${numberOfItems}.`,
    )
  }, [lastCardMoved, registry])

  // cleanup the live region when this component is finished
  React.useEffect(() => {
    return function cleanup() {
      liveRegion.cleanup()
    }
  }, [])

  const getListLength = React.useCallback(() => items.length, [items.length])

  const contextValue: ListContextValue = React.useMemo(() => {
    return {
      registerItem: registry.register,
      reorderItem,
      instanceId,
      getListLength,
    }
  }, [registry.register, reorderItem, instanceId, getListLength])

  return (
    <div>
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className={cx(
                "ml-auto hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex",
              )}
              isLoading={isReordering}
              loadingText="Reordering..."
              aria-label="Configure column visibility and order"
            >
              <RiEqualizer2Line className="size-4" aria-hidden="true" />
              View
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={7}
            collisionPadding={8}
            avoidCollisions={true}
            className="z-50 w-fit min-w-60 space-y-2"
          >
            <Label className="font-medium">Display properties</Label>
            <ListContext.Provider value={contextValue}>
              <div 
                className="flex flex-col"
                role="list"
                aria-label="Column visibility and order settings"
              >
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No configurable columns available
                  </div>
                ) : (
                  items.map((item, index) => {
                    const column = table.getColumn(item.id)
                    if (!column) return null
                    return (
                      <div
                        key={column.id}
                        className={cx(!column.getCanHide() && "hidden")}
                        role="listitem"
                      >
                        <ListItem column={column} item={item} index={index} />
                      </div>
                    )
                  })
                )}
              </div>
            </ListContext.Provider>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export { ViewOptions }
