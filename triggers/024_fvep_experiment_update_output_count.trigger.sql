CREATE TRIGGER IF NOT EXISTS fvep_experiment_output_count AFTER UPDATE
    ON experiment_fvep_entity
BEGIN

    UPDATE experiment_entity SET outputCount = new.outputCount
    WHERE id = new.id;

end;