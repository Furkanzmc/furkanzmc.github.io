---
layout: post
title:  "Freeze Columns in TableView"
description: "Learn to create proxy models to freeze columns in a TableView"
date: 2021-11-28
category:
  - qml
comments: true
---

![final](/assets/images/2021-11-28-freeze-columns-with-qml-table-view/final.gif)

I recently needed to implement a [TableView](https://doc.qt.io/qt-6/qml-qtquick-tableview.html)
with frozen column support. Qt provides a good implementation of a table with good performance and
item reusing, but it does not internally support headers or frozen columns.

In order to add a header do your `TableView`, you can use
[HorizontalHeaderView](https://doc.qt.io/qt-5/qml-qtquick-controls2-horizontalheaderview.html).
This will call `QAbstractTableModel::headerData` internally when `QAbstractTableModel::data` is
called with a role. This works great, but still, it does not give you the ability to freeze certain
columns. It will use all the cells that you return from `QAbstractTableModel::headerData` and then
display them in a separate `TableView`. It internally uses a specialized version of a proxy model
called `QHeaderDataProxyModel` to do this. As a result, you end up with two table views on top of
each other, one that displays the data and one that displays the headers.

Since we want to freeze headers, we are going to have our own implementation.
When we are done with our implementation, the use of our `FrozenTableView` will be as follows:

```qml
FrozenTableView {
    frozenColumn: 3
    model: TableModel { }
    horizontalHeaderDelegate: TableViewHeaderCell {
        required property int index
        required property string display

        text: display
        cellIndex: index
    }
    delegate: TableViewCell {
        required property int index
        required property string display

        text: display
    }
}
```

We need to ability to freeze up to `n` number of columns. And once we freeze a column, we not only
need the headers to freeze, but also the data that corresponds to those headers to also freeze.
However, if you look at the documentation for
[TableView](https://doc.qt.io/qt-6/qml-qtquick-tableview.html),
you will see that it inherits from `Flickable` and it does not support flicking certain areas of
the table while the rest stays static.

Therefore, we need 4 tables:

1- One that shows the frozen header columns.

2- One that shows the un-frozen header columns.

3- One that shows the frozen data columns.

4- One that shows the un-frozen data columns.

![table_view_sketch](/assets/images/2021-11-28-freeze-columns-with-qml-table-view/table-design-sketch.png)

Just because we need to divide the representation of our model into 4, it does not mean that we
also need to divide our data to 4 so that we can support freezing columns. That would be crazy.
What we need instead is a proxy model that operates on the source model and transforms it to

Let's start with the fundamentals. We need a table model that we can apply proxies to.

```cpp
// TableModel.cpp
namespace {
constexpr std::array<char, 26> s_characters{ 'A', 'B', 'C', 'D', 'E', 'F', 'G',
                                             'H', 'I', 'J', 'K', 'L', 'M', 'N',
                                             'O', 'P', 'Q', 'R', 'S', 'T', 'U',
                                             'V', 'W', 'X', 'Y', 'Z' };
}

TableModel::TableModel(QObject* parent)
  : QAbstractTableModel{ parent }
{
}

Qt::ItemFlags TableModel::flags(const QModelIndex& index) const
{
    Q_UNUSED(index);
    return Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled;
}

QHash<int, QByteArray> TableModel::roleNames() const
{
    return { { Qt::DisplayRole, "display" } };
}

int TableModel::rowCount(const QModelIndex& /*index*/) const
{
    return m_rowCount;
}

int TableModel::columnCount(const QModelIndex& /*index*/) const
{
    return m_columnCount;
}

QVariant TableModel::data(const QModelIndex& index, int role) const
{
    switch (role) {
        case Qt::DisplayRole:
            return QString{ "%1, %2" }.arg(index.column()).arg(index.row());
        default:
            break;
    }

    return {};
}

QVariant TableModel::headerData(int section,
                                Qt::Orientation orientation,
                                int role) const
{
    Q_UNUSED(orientation);
    switch (role) {
        case Qt::DisplayRole:
            return QString{ s_characters.at(section) };
        default:
            break;
    }

    return {};
}

QModelIndex TableModel::index(int row,
                              int column,
                              const QModelIndex& parent) const
{
    // NOTE: We are using the first item in our data as the header row.
    // That's why we need to add one to check for valid index.
    if (row < rowCount(parent) + 1 && column < columnCount(parent)) {
        return createIndex(row, column);
    }

    return QModelIndex{};
}
```

Once we have a working table model, we are going to create our proxy model so we can return
different parts of our model depending on our use case. We are going to call this proxy
`ModelSlice`. We want to use this to tell the proxy that we are interested in getting data in a
certain row/column range rather than everything. We will use this to customize our source model for
our frozen/un-frozen header columns.

Here's a slimmed down version of the interface of `ModelSlice`:

```cpp
class ModelSlice : public QAbstractListModel {
    Q_OBJECT

    Q_PROPERTY(int fromRow READ fromRow WRITE setFromRow NOTIFY fromRowChanged)
    Q_PROPERTY(int toRow READ toRow WRITE setToRow NOTIFY toRowChanged)
    Q_PROPERTY(int fromColumn READ fromColumn WRITE setFromColumn NOTIFY
                 fromColumnChanged)
    Q_PROPERTY(
      int toColumn READ toColumn WRITE setToColumn NOTIFY toColumnChanged)

    // We are going to be operating on the source. This model will not hold onto any data but
    // returns a slice of the data from our source.
    Q_PROPERTY(QAbstractItemModel* source READ source WRITE setSource NOTIFY
                 sourceChanged)

public:
    explicit ModelSlice(QObject* parent = nullptr);

    // We will return the same role names without altering them.
    [[nodiscard]] QHash<int, QByteArray> roleNames() const override final;

    // Row and column count will depend on the specified row/column range.
    [[nodiscard]] int rowCount(
      const QModelIndex& parent = QModelIndex{}) const override;
    [[nodiscard]] int columnCount(
      const QModelIndex& parent = QModelIndex{}) const override;

    // This will return our data in the specified row/column range.
    [[nodiscard]] QVariant data(const QModelIndex& index,
                                int role) const override;

    // In order to make this a general purpose slice, we need to implement this as well.
    [[nodiscard]] QVariant headerData(
      int section,
      Qt::Orientation orientation,
      int role = Qt::DisplayRole) const override final;

      // Getters and setters for the Q_PROPERTY declarations above...

signals:
    // Signals for our properties.

private:
    // Member variables.
};
```

We can now use this implementation to get a certain slice of a source model.

```qml
// Get me the first three rows and the first tow columns from the source model.
ModelSlice {
    source: root.model
    fromRow: 0
    toRow: 2
    fromColumn: 0
    toColumn: 1
}
```

Just as a side note, this could have been achieved with a few function calls to our table model as
well. But when dealing with QML, it's very important to make things as declarative as possible.

This `ModelSlice` only returns the main data though, we need access to the header data. So, let's
create another class that inherits from `ModelSlice` called `HeaderModelSlice`.

```cpp
class HeaderModelSlice : public ModelSlice {
    Q_OBJECT

    // This is so that we can support both vertical and horizontal headers,
    // however we will only be returning horizontal headers for simplicity.
    Q_PROPERTY(Qt::Orientation orientation READ orientation WRITE setOrientation
                 NOTIFY orientationChanged)
    // This part is important. Normally, we would auto adjust the row/column
    // range to return only the first row as a header. But in order to freeze
    // header columns, we need to adjust which columns are returned as well.
    // Keeping this here for convenience in case the header is used when there's no need for
    // freezing columns in other places.
    Q_PROPERTY(bool useExplicitRange READ useExplicitRange WRITE
                 setUseExplicitRange NOTIFY useExplicitRangeChanged)

public:
    explicit HeaderModelSlice(QObject* parent = nullptr);

    // This will actually internally call source->headerData so that we can
    // treat this proxy as a gateway to the underlying header.
    [[nodiscard]] QVariant data(const QModelIndex& index,
                                int role) const override final;

    // We have to specialize row/column count here because depending on the
    // orientation, one of them will only be one, e.g for a horizontal header we
    // return a row count of 0.
    [[nodiscard]] int rowCount(
      const QModelIndex& parent = QModelIndex{}) const override final;
    [[nodiscard]] int columnCount(
      const QModelIndex& parent = QModelIndex{}) const override final;

    // Getters and setters for the properties are omitted here...
signals:
    // Property signals.
};
```

Now that we are done with the C++ side, we can start getting into the QML land. Remember that we
established we need 4 tables to accomplish what we want to do.
Once we are done, we are going to put all these tables in a layout in such a way that the user
can't tell that we are actually using 4 different table views.

Let's go over them one by one.

## 1. One that Shows the Frozen Header Columns

This table will be optionally visible. If we don't have any frozen columns, we don't need to show
this table. Its job is to take a slice out of the header model and only show those cells. This is a
1xn type of column. We'll always have a single row since its the header, and the column will be the
number of frozen column headers we want.

```
This column is frozen, we only show cell "A" in this table.
|___|___|
⬇   ↔   ⬇
+-------+-------+-------+
|   A   |   B   |   C   |
+-------+-------+-------+
|  A:1  |  B:1  |  B:1  |
+-------+-------+-------+
```

```qml
TableView {
    id: columnHeader
    boundsBehavior: Flickable.StopAtBounds
    // We don't want interactivity here since it is frozen. Alternatively, you can enable this and
    // add scroll bars.
    interactive: false
    model: HeaderModelSlice {
        // This is our TableModel.
        source: root.model
        useExplicitRange: true
        fromRow: 0
        toRow: 0
        fromColumn: 0
        // Alternatively, we can disable column freezing, that's why we are setting the minimum
        // value to 0 here. We need the cells that go from 0 to the given frozenColumn.
        toColumn: Math.max(root.frozenColumn - 1, 0)
        orientation: Qt.Horizontal
    }

    function _updateColumnWidth(index: int, width: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }

    function _updateHorizontalHeaderHeight(height: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }
}
```

## 2. One that Shows the Un-frozen Header Columns

This table starts showing the columns starting with the column after our frozen column.

```
        This is where we start showing in this table.
        |_______|_______|
        ⬇       ↔       ⬇
+-------+-------+-------+
|   A   |   B   |   C   |
+-------+-------+-------+
|  A:1  |  B:1  |  B:1  |
+-------+-------+-------+
```

```qml
TableView {
    boundsBehavior: Flickable.StopAtBounds
    interactive: false
    model: HeaderModelSlice {
        source: root.model
        useExplicitRange: true
        fromRow: 0
        toRow: 0
        // Our header data starts from the column that we end the freezing and goes to the end of
        // the model.
        fromColumn: Math.max(root.frozenColumn, 0)
        toColumn: root.model.columnCount
        orientation: Qt.Horizontal
    }

    function _updateColumnWidth(index: int, width: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }

    function _updateHorizontalHeaderHeight(height: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }
}
```

## 3. One that Shows the Frozen Data Columns

```
    +-------+-------+-------+
    |   A   |   B   |   C   |
+-→ +-------+-------+-------+
|   |  A:1  |  B:1  |  B:1  |
|   +-------+-------+-------+
|   |  A:2  |  B:2  |  B:2  |
+-→ +-------+-------+-------+
    ⬆   ↔   ⬆
    |___|___|

We show this column and the rest of the rows in this table.
```

```qml
TableView {
    id: frozenColumnTable
    boundsBehavior: Flickable.StopAtBounds
    interactive: false
    model: HeaderModelSlice {
        id: frozenColumnModel
        source: root.model
        useExplicitRange: true
        fromRow: 0
        toRow: 0
        fromColumn: 0
        toColumn: Math.max(root.frozenColumn - 1, 0)
        orientation: Qt.Horizontal
    }

    // We need to duplicate these functions because a header cell that belongs to a
    // frozen column will have a different table view than the one that's not frozen.
    function _updateColumnWidth(index: int, width: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }

    function _updateHorizontalHeaderHeight(height: int) {
        // Skipping this for simplicity. Take a look at the GitHub repository for details.
    }
}
```

## 4. One that Shows the Un-frozen Data Columns.

This table will show the data that does not belong to our frozen column.


```
+-------+-------+-------+
|   A   |   B   |   C   |
+-------+-------+-------+ ←-+
|  A:1  |  B:1  |  B:1  |   |
+-------+-------+-------+   |
|  A:2  |  B:2  |  B:2  |   |
+-------+-------+-------+ ←-+
        ⬆       ↔       ⬆
        |_______|_______|
        We show these two cells in this table.
```

```qml
TableView {
    id: tb
    syncView: columnHeader.visible ? columnHeader : null
    syncDirection: Qt.Horizontal
    boundsBehavior: Flickable.StopAtBounds
    clip: true
    model: ModelSlice {
        // We are not using a HeaderModelSlice here because we are no longer interested in
        // ::headerData.
        source: root.model
        fromRow: 0
        toRow: root.model.rowCount
        fromColumn: frozenColumnModel.toColumn
        toColumn: root.model.columnCount
    }
}
```

## Putting It All Together

Now that we have all our 4 tables, time to put them together. We are going to use layouts to
cleverly position them so there's no gap between them and they don't look distinct but the same
table all together.

```qml
import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import Table 1.0 // This is where our TableModel and ModelSlice types are.

Control {
    id: root

    property TableModel model
    property alias delegate: tb.delegate
    // We are going to use the same delegate for our frozen and unfrozen column headers.
    property alias horizontalHeaderDelegate: columnHeader.delegate
    property alias columnSpacing: columnHeader.columnSpacing
    property alias rowSpacing: columnHeader.rowSpacing

    // NOTE: This is used to ensure that the frozen column table is wide enough to contain all the
    // frozen columns so we can properly calculate cell widths.
    property int defaultCellWidth: 100
    property int frozenColumn: -1

    // NOTE: ColumnLayout does not set implicit size so by default this will evaluate to 0 if
    // there's no padding.
    implicitWidth: Math.max(implicitBackgroundWidth + leftInset + rightInset,
                            implicitContentWidth + leftPadding + rightPadding)
    implicitHeight: Math.max(implicitBackgroundHeight + topInset + bottomInset,
                             implicitContentHeight + topPadding + bottomPadding)
    contentItem: ColumnLayout {
        spacing: 0

        RowLayout {
            height: columnHeader.height
            spacing: 0
            Layout.fillWidth: true

            TableView {
                id: frozenColumnTable
                width: privates.frozenCellsCreated ? privates.frozenColumnWidth : root.defaultCellWidth * Math.max(root.frozenColumn - 1, 0)
                boundsBehavior: Flickable.StopAtBounds
                columnSpacing: columnHeader.columnSpacing
                rowSpacing: columnHeader.rowSpacing
                interactive: false
                columnWidthProvider: (column) => privates.columnWidths[column]
                model: HeaderModelSlice {
                    id: frozenColumnModel
                    source: root.model
                    useExplicitRange: true
                    fromRow: 0
                    toRow: 0
                    fromColumn: 0
                    toColumn: Math.max(root.frozenColumn - 1, 0)
                    orientation: Qt.Horizontal
                }
                delegate: root.horizontalHeaderDelegate
                Layout.preferredWidth: width
                Layout.preferredHeight: height

                // We need to duplicate these functions because a header cell that belongs to a
                // frozen column will have a different table view than the one that's not frozen.
                function _updateColumnWidth(index: int, width: int) {
                    privates.columnWidths[index] = width

                    if (!privates.frozenCellsCreated) {
                        privates.frozenCellsCreated = index == frozenColumnModel.toColumn
                    }

                    privates.frozenColumnWidth = privates.calculateFrozenColumnTableWidth()
                    Qt.callLater(frozenRows.forceLayout)
                    Qt.callLater(frozenColumnTable.forceLayout)
                }

                function _updateHorizontalHeaderHeight(height: int) {
                    frozenColumnTable.height = height
                    columnHeader.height = height
                }
            }

            TableView {
                id: columnHeader
                boundsBehavior: Flickable.StopAtBounds
                interactive: false
                clip: true
                columnWidthProvider: (column) => privates.columnWidths[root.frozenColumn > 0 ? column + root.frozenColumn : column]
                model: HeaderModelSlice {
                    source: root.model
                    useExplicitRange: true
                    fromRow: 0
                    toRow: 0
                    fromColumn: Math.max(root.frozenColumn, 0)
                    toColumn: root.model.columnCount
                    orientation: Qt.Horizontal
                }
                Layout.preferredHeight: height
                Layout.fillWidth: true

                function _updateColumnWidth(index: int, width: int) {
                    const columnIndex = root.frozenColumn > 0 ? index + root.frozenColumn : index
                    privates.columnWidths[columnIndex] = width

                    Qt.callLater(tb.forceLayout)
                    Qt.callLater(columnHeader.forceLayout)
                }

                function _updateHorizontalHeaderHeight(height: int) {
                    columnHeader.height = height
                }
            }
        }

        RowLayout {
            spacing: 0
            Layout.fillHeight: true
            Layout.fillWidth: true

            TableView {
                id: frozenRows
                width: frozenColumnTable.width
                boundsBehavior: Flickable.StopAtBounds
                columnSpacing: columnHeader.columnSpacing
                rowSpacing: columnHeader.rowSpacing
                contentY: tb.contentY
                clip: true
                syncView: tb
                syncDirection: Qt.Vertical
                delegate: tb.delegate
                columnWidthProvider: (column) => privates.columnWidths[column]
                model: ModelSlice {
                    source: root.model
                    fromRow: 0
                    toRow: root.model.rowCount
                    fromColumn: 0
                    toColumn: frozenColumnModel.toColumn
                }
                Layout.preferredWidth: width
                Layout.fillHeight: true
            }

            TableView {
                id: tb
                columnSpacing: columnHeader.columnSpacing
                rowSpacing: columnHeader.rowSpacing
                syncView: columnHeader.visible ? columnHeader : null
                syncDirection: Qt.Horizontal
                boundsBehavior: Flickable.StopAtBounds
                clip: true
                columnWidthProvider: (column) => privates.columnWidths[root.frozenColumn > 0 ? column + root.frozenColumn : column]
                model: ModelSlice {
                    source: root.model
                    fromRow: 0
                    toRow: root.model.rowCount
                    fromColumn: frozenColumnModel.toColumn
                    toColumn: root.model.columnCount
                }
                Layout.fillWidth: true
                Layout.fillHeight: true
                ScrollBar.vertical: ScrollBar { }
                ScrollBar.horizontal: ScrollBar { }
            }
        }
    }

    QtObject {
        id: privates

        property var columnWidths: ({})
        property int frozenColumnWidth: 0
        property bool frozenCellsCreated: false

        function calculateFrozenColumnTableWidth() {
            let column = frozenColumnModel.toColumn
            let width = 0
            while (column > -1) {
                const value = privates.columnWidths[column]
                if (value !== undefined) {
                    width += value
                }

                column--
            }

            return width
        }
    }
}
```

In order to get the full experience, checkout the full source code at
[GitHub](https://github.com/Furkanzmc/FrozenTableView).
