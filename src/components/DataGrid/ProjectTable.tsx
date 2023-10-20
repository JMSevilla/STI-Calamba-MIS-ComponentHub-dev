import { DataGrid } from '@mui/x-data-grid'
import { ProjectTableProps } from '../../core/types'
import './ProjectTable.css'
export const ProjectTable: React.FC<ProjectTableProps> = ({
    columns, data, sx, loading, pageSize,
    checkboxSelection = false, disableRowSelectionOnClick = false,
    onRowSelectionModelChange, rowSelectionModel
}) => {
    return (
        <>
            <DataGrid 
                loading={loading}
                sx={sx}
                rows={data}
                columns={columns}
                autoHeight
                disableColumnMenu
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick={disableRowSelectionOnClick}
                pagination
                initialState={{
                    pagination: { paginationModel: {pageSize: pageSize}}
                }}
                pageSizeOptions={[10, 20, 35]}
                rowHeight={100}
                onRowSelectionModelChange={onRowSelectionModelChange}
                rowSelection
                rowSelectionModel={rowSelectionModel}
            />
        </>
    )
}