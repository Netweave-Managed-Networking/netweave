import { ReactNode } from 'react';

export type TableProps = {
  headerTitles: string[];
  rowItems: Row[];
};

export type Row = {
  key: string;
  nodes: ReactNode[];
};

type RowWithKeys = {
  key: string;
  items: RowItem[];
};

type RowItem = {
  key: string;
  node: ReactNode;
};

export default function Table({ headerTitles, rowItems }: TableProps) {
  const rowsKeyed = addKeysToTableColumns(rowItems, headerTitles);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headerTitles.map((title) => (
                    <th key={title} scope="col" className="px-6 py-3 text-left text-xs font-bold whitespace-nowrap text-gray-500 uppercase">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rowsKeyed.map((row) => (
                  <tr key={row.key}>
                    {row.items.map((item) => (
                      <td key={item.key} className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-800">
                        {item.node}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const addKeysToTableColumns = (rowItems: Row[], headerTitles: string[]): RowWithKeys[] =>
  rowItems.map((row) => ({
    key: row.key,
    items: row.nodes.map((node, index) => ({
      key: `${row.key}_${headerTitles.at(index)?.replaceAll(' ', '_')}`,
      node: node,
    })),
  }));
