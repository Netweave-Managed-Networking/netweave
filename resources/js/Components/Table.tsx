export type TableProps = {
  headerTitles: string[];
  rowItems: string[][];
};

export default function Table({ headerTitles, rowItems }: TableProps) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {headerTitles.map(title => (
                    <th
                      key={title}
                      scope="col"
                      className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase whitespace-nowrap"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rowItems.map(item => (
                  <tr key={item.join()}>
                    {item.map(value => (
                      <td
                        key={value}
                        className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap"
                      >
                        {value}
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
